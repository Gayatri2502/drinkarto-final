import 'dotenv/config';
import {db} from '../src/lib/db';
import catalogue from '../src/content/catalogue.json';
import prices from '../src/content/prices.json';
import {sources} from '../src/content/public';
for(const p of catalogue) await db.publicProduct.upsert({where:{id:p.id},create:{id:p.id,name:p.name,category:p.category,reference:p},update:{name:p.name,category:p.category,reference:p}});
for(const [authority,source] of Object.entries(sources)) {
 const rows=prices.filter(p=>p.sourceId===authority);
 if(rows.length===0) continue;
 const state=rows[0].state;
 // Bootstrap only: never replace a subsequently refreshed official snapshot.
 await db.publicPriceSnapshot.upsert({where:{authority},create:{authority,state,rows,sourceUrl:source.document,published:source.published,effective:source.effective,checkedAt:new Date('2026-10-05T00:00:00Z')},update:{}});
}
console.log(`Imported ${catalogue.length} refined reference identities. Existing live snapshots preserved.`);await db.$disconnect();
