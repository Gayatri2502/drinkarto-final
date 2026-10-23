import {notFound} from 'next/navigation';
import {db} from '@/lib/db';
import {livePriceComparisons} from '@/lib/live-prices';
import PriceBrowser from '@/components/price-browser';
import FoodPairings from '@/components/food-pairings';
import {BottleReferenceImage} from '@/components/bottle-reference-image';
import {profiles} from '@/content/public';
export const dynamic='force-dynamic';
export const metadata={title:'Liquor identity, state price references & food pairings'};
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{name?:string;category?:string}>}){const {id}=await params;const query=await searchParams;let name='',category='';if(id==='official'){if(!query.name||query.name.length>250)notFound();const found=await livePriceComparisons({q:query.name,category:query.category,limit:50});const match=found.rows.find(r=>r.name===query.name);if(!match)notFound();name=match.name;category=match.category;}else{const product=await db.publicProduct.findUnique({where:{id}});if(!product)notFound();name=product.name;category=product.category;}
 const profile=profiles.find(p=>p.id===category.toLowerCase());return <article className="public-container public-page"><p className="public-eyebrow">DRINKARTO · BOTTLE PASSPORT</p><h1>{name}</h1><p className="public-intro">{category} · Identity, dated state references and a place at the table.</p><div className="localpour-venues"><BottleReferenceImage category={category}/><section><h2>Know this bottle</h2><p>{profile?.description??'Producer-specific tasting details have not been verified for this identity.'}</p><p>Category-level context only. Exact ABV, origin, age statement and ingredients must be verified on the producer label. We do not infer these from a product name.</p><a href={'https://www.google.com/search?q='+encodeURIComponent(name+' official producer') } target="_blank" rel="noreferrer">Find producer information ↗</a></section></div><h2>StateLens · published price matches</h2><p>Search matches may include related variants. Check exact name, pack size, source and dates.</p><PriceBrowser initialQuery={name}/><FoodPairings category={category}/></article>}
