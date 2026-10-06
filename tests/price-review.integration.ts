import 'dotenv/config';
import assert from 'node:assert/strict';
import {db} from '../src/lib/db';
import {reviewImport} from '../src/lib/price-review';
import {randomUUID} from 'node:crypto';
// Isolated unknown authority: rejection paths cannot publish or alter real snapshots.
const id=randomUUID(),user='test-'+randomUUID();
await assert.rejects(reviewImport(user,id,'APPROVED'),/permission/);
process.env.PRICE_REVIEWER_USER_IDS=user;
const rejected=await db.priceReview.create({data:{authority:'test-'+id,reason:'Test review only',payload:{snapshot:{},baseCheckedAt:null}}});
const result=await reviewImport(user,rejected.id,'REJECTED');assert.equal(result.reviewedBy,user);assert.equal(result.status,'REJECTED');await assert.rejects(reviewImport(user,rejected.id,'REJECTED'),/already resolved/);
const invalid=await db.priceReview.create({data:{authority:'test-'+id,reason:'Invalid payload must never publish',payload:{snapshot:{},baseCheckedAt:null}}});await assert.rejects(reviewImport(user,invalid.id,'APPROVED'));assert.equal((await db.priceReview.findUniqueOrThrow({where:{id:invalid.id}})).status,'PENDING');
await db.priceReview.update({where:{id:invalid.id},data:{status:'REJECTED',reviewedBy:user,reviewedAt:new Date()}});
await db.$disconnect();console.log('5 source-review integration checks passed: authorization, rejection audit, replay rejection and invalid import rollback.');
