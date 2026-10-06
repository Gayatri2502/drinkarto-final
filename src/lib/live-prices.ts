import {db} from './db';
import {filterPrices} from './public-prices';
import type {PriceRow} from '@/content/public';
export type PriceComparisonProduct={key:string;name:string;category:string;sizes:Record<string,Record<string,PriceRow[]>>};
function canonicalLiquorName(value:string){return value.replace(/[`’‘]/g,"'").replace(/\b\d{2,4}\s*ml\b(?:\s*[x×]\s*\d+\s*(?:btls?|bottles?|packs?)?)?/gi,' ').replace(/\s*\(\s*\d{1,6}\s*\)/g,' ').replace(/\s+/g,' ').trim().replace(/[\s,;:-]+$/,'');}
export async function livePriceComparisons(input:{q?:string;category?:string;page?:number;limit?:number}){
 const snapshots=await db.publicPriceSnapshot.findMany();
 if(!snapshots.length) throw new Error('Official catalogue has not been initialized');
 const all=snapshots.flatMap(s=>(s.rows as unknown as PriceRow[]).map(p=>({...p,sourceUrl:s.sourceUrl,checkedAt:s.checkedAt.toISOString(),published:s.published,effective:p.effective??s.effective})));
 const q=(input.q??'').trim().toLocaleLowerCase();
 const groups=new Map<string,PriceComparisonProduct>();
 for(const row of all){
  const originalName=row.name.replace(/\s+/g,' ').trim();
  const name=canonicalLiquorName(originalName)||originalName;
  const key=`${row.category.toLocaleLowerCase()}|${name.toLocaleLowerCase()}`;
  if(q&&!originalName.toLocaleLowerCase().includes(q)&&!name.toLocaleLowerCase().includes(q))continue;
  if(input.category&&row.category!==input.category)continue;
  let group=groups.get(key);
  if(!group){group={key,name,category:row.category,sizes:{}};groups.set(key,group);}
  else if(name.length<group.name.length)group.name=name;
  const size=String(row.sizeMl);group.sizes[size]??={};group.sizes[size][row.state]??=[];group.sizes[size][row.state].push(row);
 }
 const sorted=[...groups.values()].sort((a,b)=>a.name.localeCompare(b.name)||a.category.localeCompare(b.category));
 const limit=Math.max(1,Math.min(50,Math.floor(input.limit??20)));
 const pages=Math.max(1,Math.ceil(sorted.length/limit));
 const page=Math.min(pages,Math.max(1,Math.floor(input.page??1)));
 return {rows:sorted.slice((page-1)*limit,page*limit),total:sorted.length,page,pages,states:snapshots.map(s=>s.state).sort(),checked:snapshots.map(s=>s.checkedAt.toISOString()).sort().at(-1)};
}
export async function livePrices(input:Parameters<typeof filterPrices>[0]){
 const snapshots=await db.publicPriceSnapshot.findMany();
 if(!snapshots.length) throw new Error('Official catalogue has not been initialized');
 const records=snapshots.flatMap(s=>(s.rows as unknown as PriceRow[]).map(p=>({...p,sourceUrl:s.sourceUrl,checkedAt:s.checkedAt.toISOString(),published:s.published,effective:p.effective??s.effective})));
 const result=filterPrices(input,records);
 return {...result,checked:snapshots.map(s=>s.checkedAt.toISOString()).sort().at(-1),coverage:snapshots.map(s=>s.state),sources:snapshots.map(s=>({state:s.state,checkedAt:s.checkedAt,sourceUrl:s.sourceUrl,published:s.published,effective:s.effective})),refreshIntervalHours:Number(process.env.PRICE_REFRESH_HOURS??3)};
}
