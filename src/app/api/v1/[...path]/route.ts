import {platformReviewer,reviewImport,sourceHealthMessage} from "@/lib/price-review";
import {fulfilOrder,recordFinance,returnOrder,invoiceBalance} from "@/lib/fulfilment";
import { reports } from "@/lib/reports";
import { answerQuestion } from "@/lib/ai";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z, ZodError } from "zod";
import { hash, compare } from "bcryptjs";
import { db } from "@/lib/db";
import {
  context,
  issueSession,
  checkOrigin,
  throttle,
  digest,
} from "@/lib/auth";
import { HttpError, available } from "@/lib/policy";
import { adjustStock, createOrder, transitionOrder } from "@/lib/operations";
const credentials = z
  .object({
    email: z
      .email()
      .max(254)
      .transform((s) => s.toLowerCase()),
    password: z
      .string()
      .min(12)
      .max(72)
      .refine(
        (v) => Buffer.byteLength(v, "utf8") <= 72,
      "Password must be at most 72 UTF-8 bytes",
      ),
  })
  .strict();
const recordId = z.string().min(1).max(100).regex(/^[A-Za-z0-9_-]+$/);
async function handle(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    checkOrigin(request);
    const path = (await params).path.join("/");
    const method = request.method;
    if (path === "auth/register" && method === "POST") {
      const input = credentials
        .extend({
          name: z.string().min(2).max(100),
          organization: z.string().min(2).max(100),
          jurisdiction: z.string().min(2).max(100),
        })
        .parse(await request.json());
      await throttle(input.email);
      const passwordHash = await hash(input.password, 12);
      const result = await db.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email: input.email, name: input.name, passwordHash },
        });
        const org = await tx.organization.create({
          data: {
            name: input.organization,
            jurisdiction: input.jurisdiction,
            members: { create: { userId: user.id, role: "OWNER" } },
          },
        });
        return { user, org };
      });
      await issueSession(result.user.id, result.org.id);
      return NextResponse.json({ ok: true }, { status: 201 });
    }
    if (path === "auth/login" && method === "POST") {
      const input = credentials.parse(await request.json());
      await throttle(input.email);
      const user = await db.user.findUnique({
        where: { email: input.email },
        include: { members: true },
      });
      if (
        !user ||
        !(await compare(input.password, user.passwordHash)) ||
        !user.members[0]
      )
        throw new HttpError(401, "Invalid credentials");
      await issueSession(user.id, user.members[0].organizationId);
      return NextResponse.json({ ok: true });
    }
    if (path === "auth/logout" && method === "POST") {
      const token = (await cookies()).get("drinkarto_session")?.value;
      if (token) await db.session.deleteMany({ where: { id: digest(token) } });
      (await cookies()).delete("drinkarto_session");
      return NextResponse.json({ ok: true });
    }
    if (method === "POST" && path === "ai/chat") {
      const actor = await context("approve");
      await throttle("ai:" + actor.userId);
      const { question, conversationId } = z
        .object({ question: z.string().min(3).max(1000) })
        .extend({ conversationId: z.uuid().optional() }).strict()
        .parse(await request.json());
      let conversation = conversationId ? await db.aiConversation.findFirst({ where: { id: conversationId, organizationId: actor.organizationId, userId: actor.userId } }) : null;
      if (conversationId && !conversation) throw new HttpError(404, "Conversation not found");
      const history = conversation ? (await db.aiMessage.findMany({ where: { organizationId: actor.organizationId, conversationId: conversation.id, role: { in: ["user", "assistant"] } }, orderBy: { createdAt: "desc" }, take: 12 })).reverse().map((message) => ({ role: message.role as "user" | "assistant", content: message.content })) : [];
      const result = await answerQuestion(actor.organizationId, question, history);
      const conversationTitle = question.trim().replace(/\s+/g, " ").slice(0, 80);
      const saved = await db.$transaction(async (tx) => {
        const current = conversation ?? await tx.aiConversation.create({ data: { organizationId: actor.organizationId, userId: actor.userId, title: conversationTitle } });
        await tx.aiMessage.createMany({ data: [
          { organizationId: actor.organizationId, conversationId: current.id, role: "user", content: question },
          { organizationId: actor.organizationId, conversationId: current.id, role: "assistant", content: result.answer, sources: result.sources },
        ] });
        await tx.aiConversation.update({ where: { organizationId_id: { organizationId: actor.organizationId, id: current.id } }, data: { updatedAt: new Date() } });
        return current;
      });
      return NextResponse.json({ ...result, conversationId: saved.id });
    }
    if (method === "GET") {
      const actor = await context();
      if (
        !["OWNER", "MANAGER"].includes(actor.role) &&
        !["me", "products", ...(actor.role === "ACCOUNTS" ? ["invoices", "retailers", "analytics"] : [])].includes(path)
      )
        throw new HttpError(403, "Permission denied");
      const where = { organizationId: actor.organizationId };
      if (path === "ai/conversations") {
        const conversations = await db.aiConversation.findMany({ where: { organizationId: actor.organizationId, userId: actor.userId }, take: 30, orderBy: { updatedAt: "desc" }, select: { id: true, title: true, createdAt: true, updatedAt: true, _count: { select: { messages: true } } } });
        return NextResponse.json(conversations);
      }
      if (/^ai\/conversations\/[a-f0-9-]+$/.test(path)) {
        const id = z.uuid().parse(path.split("/")[2]);
        const conversation = await db.aiConversation.findFirst({ where: { id, organizationId: actor.organizationId, userId: actor.userId }, select: { id: true, title: true, createdAt: true, updatedAt: true } });
        if (!conversation) throw new HttpError(404, "Conversation not found");
        const messages = (await db.aiMessage.findMany({ where: { organizationId: actor.organizationId, conversationId: id }, take: 40, orderBy: { createdAt: "desc" }, select: { id: true, role: true, content: true, sources: true, createdAt: true } })).reverse();
        return NextResponse.json({ ...conversation, messages });
      }
      if(path==='price-health'){const [snapshots,runs,alerts,reviews]=await Promise.all([db.publicPriceSnapshot.findMany({select:{authority:true,state:true,checkedAt:true,sourceUrl:true}}),db.priceRefreshRun.findMany({take:30,orderBy:{startedAt:'desc'}}),db.priceAlert.findMany({where:{status:'OPEN'}}),platformReviewer(actor.userId)?db.priceReview.findMany({where:{status:'PENDING'},orderBy:{createdAt:'desc'},take:20}):Promise.resolve([])]);return NextResponse.json({snapshots:snapshots.map(s=>({...s,stale:Date.now()-s.checkedAt.getTime()>Number(process.env.PRICE_REFRESH_HOURS??24)*7200000})),runs:runs.map(r=>({...r,message:sourceHealthMessage(r.message)})),alerts:alerts.map(a=>({...a,message:sourceHealthMessage(a.message)})),reviews,canReview:platformReviewer(actor.userId)});}
      if (path === "reports") {const days=z.coerce.number().int().min(1).max(365).parse(new URL(request.url).searchParams.get("days")??30);return NextResponse.json(await reports(actor.organizationId,days));}
      if (path === "invoices") return NextResponse.json((await db.invoice.findMany({where,take:100,orderBy:{createdAt:"desc"},include:{order:{include:{retailer:true,items:{include:{product:true}}}},entries:{orderBy:{createdAt:"desc"}}}})).map(i=>({...i,balance:invoiceBalance(i).toString()})));
      if (path === "me") return NextResponse.json(actor);
      if (path === "retailers")
        return NextResponse.json(
          await db.retailer.findMany({
            where,
            take: 100,
            orderBy: { name: "asc" },
          }),
        );
      if (path === "products")
        return NextResponse.json(
          (
            await db.product.findMany({
              where,
              take: 100,
              orderBy: { name: "asc" },
            })
          ).map((p) => ({ ...p, available: available(p) })),
        );
      if (path === "orders")
        return NextResponse.json(
          await db.order.findMany({
            where,
            take: 100,
            orderBy: { createdAt: "desc" },
            include: { retailer: true, items: true, invoice: true },
          }),
        );
      if (path === "audit")
        return NextResponse.json(
          await db.auditLog.findMany({
            where,
            take: 100,
            orderBy: { createdAt: "desc" },
          }),
        );
      if (path === "analytics") {
        const [products, retailers, orders, pendingOrders, pendingOrderCount, invoices, recentActivity] = await Promise.all([
          db.product.findMany({ where }),
          db.retailer.count({ where }),
          db.order.aggregate({
            where: { ...where, status: { not: "CANCELLED" } },
            _count: true,
            _sum: { total: true },
          }),
          db.order.findMany({ where: { ...where, status: "PENDING_APPROVAL" }, take: 5, orderBy: { createdAt: "desc" }, include: { retailer: true } }),
          db.order.count({ where: { ...where, status: "PENDING_APPROVAL" } }),
          db.invoice.findMany({ where, orderBy: { createdAt: "desc" }, include: { order: { include: { retailer: true } } } }),
          db.auditLog.findMany({ where, take: 5, orderBy: { createdAt: "desc" } }),
        ]);
        const lowStockProducts = products.filter((p) => available(p) <= p.minimumStock).map((p) => ({ id: p.id, name: p.name, sku: p.sku, available: available(p), threshold: p.minimumStock }));
        const unpaidInvoices = invoices.filter((invoice) => Number(invoice.total.minus(invoice.credited).minus(invoice.paid).plus(invoice.refunded)) > 0).slice(0, 5).map((invoice) => ({ id: invoice.id, number: invoice.number, retailer: invoice.order.retailer.name, balance: invoice.total.minus(invoice.credited).minus(invoice.paid).plus(invoice.refunded).toString(), createdAt: invoice.createdAt }));
        return NextResponse.json({
          retailers,
          orders: orders._count,
          orderValue: orders._sum.total ?? 0,
          lowStock: lowStockProducts.length,
          lowStockProducts,
          pendingOrderCount,
          pendingOrders: pendingOrders.map((order) => ({ id: order.id, retailer: order.retailer.name, total: order.total, createdAt: order.createdAt })),
          unpaidInvoiceCount: unpaidInvoices.length,
          unpaidInvoices,
          recentActivity,
          inventoryValue: products.reduce(
            (n, p) => n + p.physical * Number(p.unitPrice),
            0,
          ),
        });
      }
    }
    if(method==='POST' && /^price-reviews\/[a-f0-9-]+\/(approve|reject)$/.test(path)){const actor=await context('approve');return NextResponse.json(await reviewImport(actor.userId,z.uuid().parse(path.split('/')[1]),path.endsWith('approve')?'APPROVED':'REJECTED'));}
    if(method==='POST' && path==='price-alerts/acknowledge'){const actor=await context('approve');if(!platformReviewer(actor.userId))throw new HttpError(403,'Platform source-review permission required');const {authority}=z.object({authority:z.string().min(1).max(80)}).strict().parse(await request.json());return NextResponse.json(await db.priceAlert.update({where:{authority},data:{acknowledgedBy:actor.userId,acknowledgedAt:new Date()}}));}
    if (method === "POST" && path === "retailers") {
      const actor = await context("retailers");
      const input = z
        .object({
          name: z.string().min(2).max(150),
          email: z.preprocess(
            (v) => (v === "" ? undefined : v),
            z.email().optional(),
          ),
          creditLimit: z.coerce.number().min(0).max(1e10),
          licenceNumber: z.string().max(100).optional(),
        })
        .strict()
        .parse(await request.json());
      return NextResponse.json(
        await db.$transaction(async (tx) => {
          const r = await tx.retailer.create({
            data: { ...input, organizationId: actor.organizationId },
          });
          await tx.auditLog.create({
            data: {
              organizationId: actor.organizationId,
              actorId: actor.userId,
              action: "retailer.create",
              entity: "Retailer",
              entityId: r.id,
              data: { name: r.name },
            },
          });
          return r;
        }),
        { status: 201 },
      );
    }
    if (method === "POST" && path === "products") {
      const actor = await context("products");
      const input = z
        .object({
          name: z.string().min(2).max(150),
          sku: z.string().min(1).max(80),
          brand: z.string().min(1).max(100),
          category: z.string().min(1).max(100),
          unitPrice: z.coerce.number().positive().max(1e8),
          minimumStock: z.coerce.number().int().min(0).max(1e6),
        })
        .strict()
        .parse(await request.json());
      return NextResponse.json(
        await db.$transaction(async (tx) => {
          const p = await tx.product.create({
            data: { ...input, organizationId: actor.organizationId },
          });
          await tx.auditLog.create({
            data: {
              organizationId: actor.organizationId,
              actorId: actor.userId,
              action: "product.create",
              entity: "Product",
              entityId: p.id,
              data: { sku: p.sku },
            },
          });
          return p;
        }),
        { status: 201 },
      );
    }
    if (method === "POST" && ["inventory/adjust","inventory/receive"].includes(path)) {
      const actor = await context("stock");
      const input = z
        .object({
          productId: recordId,
          quantity: z
            .number()
            .int()
            .min(-1e6)
            .max(1e6)
            .refine((n) => n !== 0),
          reason: z.string().min(5).max(500),
        })
        .strict()
        .parse(await request.json());
      if(path === "inventory/receive" && input.quantity < 1) throw new HttpError(400,"Receipt quantity must be positive");
      return NextResponse.json(await adjustStock(actor, {...input,receipt:path === "inventory/receive"}));
    }
    if (method === "POST" && path === "orders") {
      const actor = await context("orders");
      const input = z
        .object({
          retailerId: recordId,
          items: z
            .array(
              z
                .object({
                  productId: recordId,
                  quantity: z.number().int().positive().max(1e6),
                })
                .strict(),
            )
            .min(1)
            .max(100),
        })
        .strict()
        .parse(await request.json());
      return NextResponse.json(await createOrder(actor, input), {
        status: 201,
      });
    }
    if (method === "PATCH" && /^products\/[A-Za-z0-9_-]{1,100}$/.test(path)) {
      const actor = await context("products");
      const id = recordId.parse(path.split("/")[1]);
      const input = z.object({
        name: z.string().min(2).max(150), sku: z.string().min(1).max(80),
        brand: z.string().min(1).max(100), category: z.string().min(1).max(100),
        unitPrice: z.coerce.number().positive().max(1e8), minimumStock: z.coerce.number().int().min(0).max(1e6),
      }).strict().parse(await request.json());
      return NextResponse.json(await db.$transaction(async (tx) => {
        const where = { organizationId_id: { organizationId: actor.organizationId, id } };
        if (!await tx.product.findUnique({ where })) throw new HttpError(404, "Product not found");
        const product = await tx.product.update({ where, data: input });
        await tx.auditLog.create({ data: { organizationId: actor.organizationId, actorId: actor.userId, action: "product.update", entity: "Product", entityId: id, data: { sku: product.sku } } });
        return product;
      }));
    }
    if (method === "PATCH" && /^retailers\/[A-Za-z0-9_-]{1,100}$/.test(path)) {
      const actor = await context("retailers");
      const id = recordId.parse(path.split("/")[1]);
      const input = z.object({
        name: z.string().min(2).max(150),
        email: z.preprocess((value) => value === "" ? null : value, z.union([z.email(), z.null()]).optional()),
        creditLimit: z.coerce.number().min(0).max(1e10),
        licenceNumber: z.preprocess((value) => value === "" ? null : value, z.union([z.string().max(100), z.null()]).optional()),
      }).strict().parse(await request.json());
      return NextResponse.json(await db.$transaction(async (tx) => {
        const where = { organizationId_id: { organizationId: actor.organizationId, id } };
        if (!await tx.retailer.findUnique({ where })) throw new HttpError(404, "Retailer not found");
        const retailer = await tx.retailer.update({ where, data: input });
        await tx.auditLog.create({ data: { organizationId: actor.organizationId, actorId: actor.userId, action: "retailer.update", entity: "Retailer", entityId: id, data: { name: retailer.name } } });
        return retailer;
      }));
    }
    if (method === "DELETE" && /^products\/[A-Za-z0-9_-]{1,100}$/.test(path)) {
      const actor = await context("products");
      const id = recordId.parse(path.split("/")[1]);
      return NextResponse.json(await db.$transaction(async (tx) => {
        const where = { organizationId_id: { organizationId: actor.organizationId, id } };
        const product = await tx.product.findUnique({ where });
        if (!product) throw new HttpError(404, "Product not found");
        const [items, movements] = await Promise.all([
          tx.orderItem.count({ where: { organizationId: actor.organizationId, productId: id } }),
          tx.inventoryMovement.count({ where: { organizationId: actor.organizationId, productId: id } }),
        ]);
        if (items || movements || product.physical || product.reserved || product.damaged) throw new HttpError(409, "This product has stock or business history, so it cannot be deleted. Keep the record for reporting and audit history.");
        await tx.product.delete({ where });
        await tx.auditLog.create({ data: { organizationId: actor.organizationId, actorId: actor.userId, action: "product.delete", entity: "Product", entityId: id, data: { sku: product.sku } } });
        return { deleted: true, name: product.name };
      }));
    }
    if (method === "DELETE" && /^retailers\/[A-Za-z0-9_-]{1,100}$/.test(path)) {
      const actor = await context("retailers");
      const id = recordId.parse(path.split("/")[1]);
      return NextResponse.json(await db.$transaction(async (tx) => {
        const where = { organizationId_id: { organizationId: actor.organizationId, id } };
        const retailer = await tx.retailer.findUnique({ where });
        if (!retailer) throw new HttpError(404, "Retailer not found");
        const orderCount = await tx.order.count({ where: { organizationId: actor.organizationId, retailerId: id } });
        if (orderCount || Number(retailer.outstanding) > 0) throw new HttpError(409, "This retailer has orders or an open balance, so it cannot be deleted. Keep the record for reporting and audit history.");
        await tx.retailer.delete({ where });
        await tx.auditLog.create({ data: { organizationId: actor.organizationId, actorId: actor.userId, action: "retailer.delete", entity: "Retailer", entityId: id, data: { name: retailer.name } } });
        return { deleted: true, name: retailer.name };
      }));
    }
    if (method === "DELETE" && /^ai\/conversations\/[a-f0-9-]+$/.test(path)) {
      const actor = await context("approve");
      const id = z.uuid().parse(path.split("/")[2]);
      const deleted = await db.aiConversation.deleteMany({ where: { id, organizationId: actor.organizationId, userId: actor.userId } });
      if (!deleted.count) throw new HttpError(404, "Conversation not found");
      return NextResponse.json({ deleted: true });
    }
    if (method === "POST" && /^orders\/[A-Za-z0-9_-]{1,100}\/fulfil$/.test(path)) {
      const actor=await context("approve");
      return NextResponse.json(await fulfilOrder(actor,recordId.parse(path.split("/")[1])));
    }
    if (method === "POST" && /^orders\/[A-Za-z0-9_-]{1,100}\/return$/.test(path)) {
      const actor=await context("approve");
      const input=z.object({items:z.array(z.object({productId:recordId,quantity:z.number().int().positive().max(1e6)}).strict()).min(1).max(100),reason:z.string().min(5).max(500),requestKey:z.uuid()}).strict().parse(await request.json());
      return NextResponse.json(await returnOrder(actor,recordId.parse(path.split("/")[1]),input));
    }
    if (method === "POST" && /^invoices\/[A-Za-z0-9_-]{1,100}\/(payment|refund)$/.test(path)) {
      const actor=await context("finance");
      const input=z.object({amount:z.string().regex(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/).refine(v=>Number(v)>0),reference:z.string().min(3).max(200),requestKey:z.uuid()}).strict().parse(await request.json());
      return NextResponse.json(await recordFinance(actor,recordId.parse(path.split("/")[1]),{...input,kind:path.endsWith("payment")?"PAYMENT":"REFUND"}));
    }
    if (
      method === "POST" &&
      /^orders\/[A-Za-z0-9_-]{1,100}\/(approve|cancel)$/.test(path)
    ) {
      const [, id, action] = path.split("/");
      const actor = await context("approve");
      return NextResponse.json(
        await transitionOrder(
          actor,
          recordId.parse(id),
          action as "approve" | "cancel",
        ),
      );
    }
    throw new HttpError(404, "Endpoint not found");
  } catch (e) {
    if (e instanceof SyntaxError)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    if (e instanceof Error && ["TimeoutError", "AbortError"].includes(e.name))
      return NextResponse.json(
        { error: "AI request timed out. Try again later." },
        { status: 504 },
      );
    if (e instanceof HttpError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof ZodError)
      return NextResponse.json(
        {
          error: "Invalid input",
          details: e.issues.map((i) => ({ path: i.path, message: i.message })),
        },
        { status: 400 },
      );
    const code = (e as { code?: string }).code;
    if (code === "P2002")
      return NextResponse.json(
        { error: "Record already exists" },
        { status: 409 },
      );
    if (code === "P2034")
      return NextResponse.json(
        { error: "Concurrent change. Refresh and retry." },
        { status: 409 },
      );
    console.error("Request failed", e instanceof Error ? e.name : "Unknown");
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
