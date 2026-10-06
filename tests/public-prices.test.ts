import {describe,it,expect} from 'vitest';
import {filterPrices,priceRecords} from '../src/lib/public-prices';
import {sources} from '../src/content/public';
describe('public price references',()=>{
 it('classifies explicitly named beer as Beer despite a mismatched source category',()=>{const rows=filterPrices({q:'10000 Volts',state:'Tamil Nadu',category:'Beer'}).rows;expect(rows.length).toBeGreaterThan(0);expect(rows.every(r=>r.category==='Beer')).toBe(true)});
 it('uses the verified Kerala retail column for Old Monk',()=>{const result=filterPrices({q:'Old Monk Matured Xxx Premium Rum',state:'Kerala',size:'750'});expect(result.rows.some(p=>p.price===1140&&p.sourceCode==='13074101X')).toBe(true)});
 it('uses TASMAC MRP per bottle, independently of warehouse prices',()=>{const result=filterPrices({q:'ACCORD NO.1 BLENDED WHISKY',state:'Tamil Nadu',size:'750'});expect(result.rows.some(p=>p.price===680)).toBe(true)});
 it('does not invent price records for uncovered states',()=>expect(filterPrices({state:'Rajasthan'}).total).toBe(0));
 it('keeps size and state filtering exact',()=>expect(filterPrices({state:'Kerala',size:'375',category:'Rum'}).rows.every(p=>p.state==='Kerala'&&p.sizeMl===375&&p.category==='Rum')).toBe(true));
 it('bounds results and keeps pagination stable',()=>{const a=filterPrices({limit:20,page:1}),b=filterPrices({limit:20,page:2});expect(a.rows).toHaveLength(20);expect(b.rows).toHaveLength(20);expect(new Set([...a.rows,...b.rows].map(r=>r.id)).size).toBe(40)});
 it('requires public provenance and positive bottle prices',()=>{expect(priceRecords.every(p=>p.price>0&&p.sizeMl>0&&p.sizeMl<=2000&&Boolean(sources[p.sourceId]))).toBe(true);expect(new Set(priceRecords.map(p=>p.id)).size).toBe(priceRecords.length)});
});
