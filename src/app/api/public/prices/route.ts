import {NextResponse} from 'next/server';
import {livePrices} from '@/lib/live-prices';
import {z} from 'zod';
const schema=z.object({sort:z.literal('price-asc').optional(),q:z.string().max(120).optional(),state:z.string().max(50).optional(),category:z.string().max(30).optional(),size:z.string().max(15).optional(),page:z.coerce.number().int().min(1).max(10000).optional(),limit:z.coerce.number().int().min(1).max(40).optional()});
export async function GET(request:Request){const result=schema.safeParse(Object.fromEntries(new URL(request.url).searchParams));if(!result.success)return NextResponse.json({error:'Invalid price filters'},{status:400});try{return NextResponse.json(await livePrices(result.data),{headers:{'Cache-Control':'public, max-age=60'}})}catch{return NextResponse.json({error:'Price reference service unavailable; please check the official source.'},{status:503})}}
