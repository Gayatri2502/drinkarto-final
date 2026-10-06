import {describe,it,expect} from 'vitest';
import {reviewReason,sourceHealthMessage} from '../src/lib/price-review';
import type {PriceRow} from '../src/content/public';
const rows=():PriceRow[]=>Array.from({length:100},(_,i)=>({id:'od-'+i,sourceCode:String(i),name:'Reference rum',category:'Rum',state:'Odisha',sizeMl:750,price:100,sourceId:'osbc-2026-27'}));
describe('price publication review',()=>{it('holds the first import',()=>expect(reviewReason(rows(),[])).toMatch('First'));it('allows routine price changes',()=>expect(reviewReason(rows().map(r=>({...r,price:110})),rows())).toBeNull());it('holds widespread price jumps',()=>expect(reviewReason(rows().map(r=>({...r,price:140})),rows())).toMatch('25%'));it('holds source identities reused for a different size',()=>{const next=rows();next[0].sizeMl=375;expect(reviewReason(next,rows())).toMatch('identities')})});

it('does not expose extraction tracebacks in business source health',()=>expect(sourceHealthMessage('Traceback /Users/test/private/file.py SSL certificate verify failed')).toBe('Official source TLS verification failed; published prices retained'));

it('holds large identity turnover even when row count stays the same',()=>expect(reviewReason(rows().map(r=>({...r,id:r.id+'x',sourceCode:r.sourceCode+'x'})),rows())).toMatch('matching review'));

it('does not mistake a timeout parameter in a traceback for the failure cause',()=>expect(sourceHealthMessage('Traceback urlopen(timeout=60) failed')).toMatch('extraction failed'));
