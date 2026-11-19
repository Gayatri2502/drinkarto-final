import {NextResponse} from 'next/server';
import {z} from 'zod';
import {categories} from '@/content/public';
import {livePriceComparisons} from '@/lib/live-prices';

const schema=z.object({occasion:z.enum(["Dinner gathering","Cocktail evening","Casual get-together"]).optional(),q:z.string().max(120).optional(),category:z.enum(categories).or(z.literal('')).optional(),page:z.coerce.number().int().min(1).max(10000).optional(),size:z.coerce.number().int().positive().optional(),min:z.coerce.number().nonnegative().optional(),max:z.coerce.number().nonnegative().optional(),limit:z.coerce.number().int().min(1).max(50).optional()});

export async function GET(request:Request){
 const parsed=schema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
 if(!parsed.success)return NextResponse.json({error:'Invalid comparison filters'},{status:400});
 try{return NextResponse.json(await livePriceComparisons(parsed.data),{headers:{'Cache-Control':'public, max-age=60'}})}
 catch{return NextResponse.json({error:'Price comparison service unavailable; please check the official sources.'},{status:503})}
}
