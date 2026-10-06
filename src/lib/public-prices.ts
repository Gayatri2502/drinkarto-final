import data from '@/content/prices.json';
import type {PriceRow} from '@/content/public';
export const priceRecords=data as PriceRow[];
export function filterPrices(input:{q?:string;state?:string;category?:string;size?:string;page?:number;limit?:number},records:PriceRow[]=priceRecords){
 const q=(input.q??'').trim().toLocaleLowerCase();const limit=Math.min(40,Math.max(1,Math.floor(input.limit??20)));
 const filtered=records.filter(p=>(!q||p.name.toLocaleLowerCase().includes(q)||p.sourceCode.toLowerCase().includes(q))&&(!input.state||input.state==='All states'||p.state===input.state)&&(!input.category||input.category==='All categories'||p.category===input.category)&&(!input.size||input.size==='All sizes'||p.sizeMl===Number(input.size))).sort((a,b)=>a.name.localeCompare(b.name)||a.state.localeCompare(b.state)||a.sizeMl-b.sizeMl);
 const pages=Math.max(1,Math.ceil(filtered.length/limit));const page=Math.min(pages,Math.max(1,Math.floor(input.page??1)));
 return {rows:filtered.slice((page-1)*limit,page*limit),total:filtered.length,page,pages,coverage:[...new Set(records.map(r=>r.state))].sort(),checked:'2026-10-05'};
}
