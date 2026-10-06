import {db} from './db';
import {Prisma} from '@/generated/prisma/client';
import {HttpError} from './policy';
type Actor={organizationId:string;userId:string};
const zero=new Prisma.Decimal(0);
export const invoiceBalance=(i:{total:Prisma.Decimal;credited:Prisma.Decimal;paid:Prisma.Decimal;refunded:Prisma.Decimal})=>i.total.minus(i.credited).minus(i.paid).plus(i.refunded);
export async function fulfilOrder(actor:Actor,id:string){return db.$transaction(async tx=>{
 const where={organizationId_id:{organizationId:actor.organizationId,id}};
 const o=await tx.order.findUnique({where,include:{items:true,invoice:true}});
 if(!o)throw new HttpError(404,'Order not found');
 if(o.status==='FULFILLED'&&o.invoice)return o.invoice;
 if(o.status!=='SUBMITTED')throw new HttpError(409,'Only submitted orders can be fulfilled');
 for(const item of o.items){const key={organizationId_id:{organizationId:actor.organizationId,id:item.productId}};const p=await tx.product.findUniqueOrThrow({where:key});if(p.reserved<item.quantity||p.physical-p.damaged<item.quantity)throw new HttpError(409,'Reserved shipment stock unavailable');
 await tx.product.update({where:key,data:{physical:{decrement:item.quantity},reserved:{decrement:item.quantity}}});
 await tx.inventoryMovement.create({data:{organizationId:actor.organizationId,productId:p.id,actorId:actor.userId,kind:'SHIPMENT',quantity:-item.quantity,previousPhysical:p.physical,newPhysical:p.physical-item.quantity,previousReserved:p.reserved,newReserved:p.reserved-item.quantity,reason:'Order fulfilled',orderId:id}});}
 const invoice=await tx.invoice.create({data:{organizationId:actor.organizationId,orderId:id,number:'INV-'+id.toUpperCase(),total:o.total}});
 await tx.order.update({where,data:{status:'FULFILLED'}});
 await tx.retailer.update({where:{organizationId_id:{organizationId:actor.organizationId,id:o.retailerId}},data:{outstanding:{increment:o.total}}});
 await tx.auditLog.create({data:{organizationId:actor.organizationId,actorId:actor.userId,action:'order.fulfil',entity:'Invoice',entityId:invoice.id,data:{orderId:id,number:invoice.number,total:invoice.total.toString()}}});return invoice;
 },{isolationLevel:'Serializable'});}
export async function recordFinance(actor:Actor,id:string,input:{kind:'PAYMENT'|'REFUND';amount:string;reference:string;requestKey:string}){return db.$transaction(async tx=>{
 const existing=await tx.financeEntry.findUnique({where:{organizationId_requestKey:{organizationId:actor.organizationId,requestKey:input.requestKey}}});const amount=new Prisma.Decimal(input.amount);
 if(existing){if(existing.invoiceId!==id||existing.kind!==input.kind||!existing.amount.eq(amount)||existing.reference!==input.reference)throw new HttpError(409,'Request key was used for different data');return existing;}
 const where={organizationId_id:{organizationId:actor.organizationId,id}};
 const i=await tx.invoice.findUnique({where,include:{order:true}});if(!i)throw new HttpError(404,'Invoice not found');const balance=invoiceBalance(i);
 if(input.kind==='PAYMENT'&&amount.gt(Prisma.Decimal.max(balance,zero)))throw new HttpError(409,'Payment exceeds remaining invoice balance');
 if(input.kind==='REFUND'&&amount.gt(Prisma.Decimal.max(balance.negated(),zero)))throw new HttpError(409,'Refund exceeds customer credit');
 await tx.invoice.update({where,data:input.kind==='PAYMENT'?{paid:{increment:amount}}:{refunded:{increment:amount}}});
 if(input.kind==='PAYMENT')await tx.retailer.update({where:{organizationId_id:{organizationId:actor.organizationId,id:i.order.retailerId}},data:{outstanding:{decrement:amount}}});
 const entry=await tx.financeEntry.create({data:{...input,amount,organizationId:actor.organizationId,invoiceId:id,actorId:actor.userId}});
 await tx.auditLog.create({data:{organizationId:actor.organizationId,actorId:actor.userId,action:'invoice.'+input.kind.toLowerCase(),entity:'Invoice',entityId:id,data:{amount:amount.toString(),reference:input.reference,entryId:entry.id}}});return entry;
 },{isolationLevel:'Serializable'});}
export async function returnOrder(actor:Actor,id:string,input:{items:{productId:string;quantity:number}[];reason:string;requestKey:string}){return db.$transaction(async tx=>{
 const where={organizationId_id:{organizationId:actor.organizationId,id}};const o=await tx.order.findUnique({where,include:{items:true,invoice:true}});if(!o)throw new HttpError(404,'Order not found');if(!o.invoice)throw new HttpError(409,'Order has not been fulfilled');
 const previous=await tx.financeEntry.findUnique({where:{organizationId_requestKey:{organizationId:actor.organizationId,requestKey:input.requestKey}}});
 const reference=JSON.stringify({orderId:id,reason:input.reason,items:[...input.items].sort((a,b)=>a.productId.localeCompare(b.productId))});
 if(previous){if(previous.kind!=='CREDIT'||previous.invoiceId!==o.invoice.id||previous.reference!==reference)throw new HttpError(409,'Request key was used for different data');return previous;}
 if(!['FULFILLED','RETURNED'].includes(o.status))throw new HttpError(409,'Only shipped goods can be returned');
 if(new Set(input.items.map(i=>i.productId)).size!==input.items.length)throw new HttpError(400,'Duplicate return products');let credit=zero;
 for(const item of input.items){const oi=o.items.find(i=>i.productId===item.productId);if(!oi||item.quantity>oi.quantity-oi.returned)throw new HttpError(409,'Return exceeds shipped quantity remaining');
 const key={organizationId_id:{organizationId:actor.organizationId,id:item.productId}};const p=await tx.product.findUniqueOrThrow({where:key});await tx.product.update({where:key,data:{physical:{increment:item.quantity}}});await tx.orderItem.update({where:{id:oi.id},data:{returned:{increment:item.quantity}}});credit=credit.plus(oi.unitPrice.mul(item.quantity));
 await tx.inventoryMovement.create({data:{organizationId:actor.organizationId,actorId:actor.userId,productId:p.id,kind:'RETURN',quantity:item.quantity,previousPhysical:p.physical,newPhysical:p.physical+item.quantity,previousReserved:p.reserved,newReserved:p.reserved,reason:input.reason,orderId:id}});}
 const reduction=Prisma.Decimal.min(credit,Prisma.Decimal.max(invoiceBalance(o.invoice),zero));
 await tx.invoice.update({where:{id:o.invoice.id},data:{credited:{increment:credit}}});
 await tx.retailer.update({where:{organizationId_id:{organizationId:actor.organizationId,id:o.retailerId}},data:{outstanding:{decrement:reduction}}});
 const allReturned=o.items.every(i=>i.returned+(input.items.find(r=>r.productId===i.productId)?.quantity??0)===i.quantity);if(allReturned)await tx.order.update({where,data:{status:'RETURNED'}});
 const entry=await tx.financeEntry.create({data:{organizationId:actor.organizationId,invoiceId:o.invoice.id,actorId:actor.userId,kind:'CREDIT',amount:credit,reference,requestKey:input.requestKey}});
 await tx.auditLog.create({data:{organizationId:actor.organizationId,actorId:actor.userId,action:'order.return',entity:'Order',entityId:id,data:{items:input.items,reason:input.reason,credit:credit.toString(),entryId:entry.id}}});return entry;
 },{isolationLevel:'Serializable'});}
