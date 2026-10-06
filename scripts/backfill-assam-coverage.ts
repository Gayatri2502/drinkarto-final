import 'dotenv/config';
import {spawn} from 'node:child_process';
import {db} from '../src/lib/db';
import {publishSnapshot} from '../src/lib/price-review';
import {validateSnapshot} from '../src/lib/price-validation';
import type {PriceRow} from '../src/content/public';

const authority='assam-2026-27';
const python=process.env.PRICE_PYTHON??'python3';

function extract():Promise<unknown>{return new Promise((resolve,reject)=>{
  const child=spawn(python,['scripts/extract-official.py',authority],{cwd:process.cwd(),env:{...process.env}});
  let output='',errors='';
  const timer=setTimeout(()=>child.kill('SIGTERM'),600000);
  child.stdout.on('data',data=>{output+=data;if(output.length>20_000_000)child.kill('SIGTERM')});
  child.stderr.on('data',data=>{errors=(errors+data).slice(-2000)});
  child.on('error',reject);
  child.on('close',code=>{clearTimeout(timer);if(code!==0)return reject(new Error(errors||'Assam source extraction failed'));try{resolve(JSON.parse(output))}catch{return reject(new Error('Assam source returned invalid JSON'))}});
});}

const snapshot=validateSnapshot(await extract(),authority,0);
const channels=[...new Set(snapshot.rows.map(row=>row.market).filter((value):value is string=>Boolean(value)))].sort();
if(snapshot.rows.length<500||channels.length<4)throw new Error(`Assam coverage guard failed (${snapshot.rows.length} rows; ${channels.length} channels)`);
const run=await db.priceRefreshRun.create({data:{authority,status:'RUNNING',message:'Full public-market coverage backfill'}});
try{
  const previous=await db.publicPriceSnapshot.findUnique({where:{authority}});
  const result=await db.$transaction(async tx=>{
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(731205)`;
    const current=await tx.publicPriceSnapshot.findUnique({where:{authority}});
    if((current?.checkedAt.toISOString()??null)!==(previous?.checkedAt.toISOString()??null))throw new Error('Assam snapshot changed during backfill; retry after reviewing the current source run');
    const published=await publishSnapshot(tx,authority,snapshot,(current?.rows??[]) as unknown as PriceRow[]);
    await tx.priceRefreshRun.update({where:{id:run.id},data:{status:'SUCCEEDED',count:snapshot.rows.length,changed:published.changed,message:`Published ${channels.join(', ')} channels`,finishedAt:published.checkedAt}});
    return published;
  },{isolationLevel:'Serializable'});
  console.log(JSON.stringify({authority,state:'Assam',rows:snapshot.rows.length,channels,changed:result.changed,checkedAt:result.checkedAt}));
}catch(error){
  await db.priceRefreshRun.update({where:{id:run.id},data:{status:'FAILED',message:String((error as Error).message).slice(0,1800),finishedAt:new Date()}});
  throw error;
}finally{await db.$disconnect()}
