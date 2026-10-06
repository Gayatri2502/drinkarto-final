import 'dotenv/config';
import {db} from '../src/lib/db';
import {reviewImport} from '../src/lib/price-review';
const [id,decision]=process.argv.slice(2);const userId=process.env.PRICE_REVIEWER_ACTOR_ID;
if(!id||!['approve','reject'].includes(decision)||!userId)throw Error('Usage: PRICE_REVIEWER_ACTOR_ID=<configured reviewer user ID> node --import tsx scripts/review-price-import.ts <review ID> approve|reject');
try{const r=await reviewImport(userId,id,decision==='approve'?'APPROVED':'REJECTED');console.log(JSON.stringify({id:r.id,status:r.status,authority:r.authority}))}finally{await db.$disconnect()}
