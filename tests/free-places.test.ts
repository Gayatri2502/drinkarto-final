import {describe,it,expect,vi,afterEach} from 'vitest';
import {freePlaces} from '../src/lib/free-places';
import {photoToken,validPhotoToken} from '../src/lib/place-photo';
afterEach(()=>vi.unstubAllGlobals());
describe('free venue discovery',()=>{
 it('filters by real radius and keeps venue identity',async()=>{const fetcher=vi.fn().mockResolvedValue({ok:true,json:async()=>({elements:[{id:1,type:'node',lat:15.49,lon:73.82,tags:{name:'Example',cuisine:'Indian'}},{id:2,type:'node',lat:20,lon:78,tags:{name:'Outside radius'}}]})});vi.stubGlobal('fetch',fetcher);const r=await freePlaces({lat:15.49,lng:73.82,radius:5,kind:'restaurant'});expect(r.places).toHaveLength(1);expect(r.places[0].id).toBe('osm:node:1');expect(String(fetcher.mock.calls[0][1].body)).toContain('ISO3166-1');});
 it('does not guess an ambiguous city',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({elements:[{lat:1,lon:2},{lat:3,lon:4}]})}));await expect(freePlaces({city:'Example',radius:5,kind:'bar'})).rejects.toThrow('Several places');});
 it('rejects modified or expired photo requests',()=>{const name='places/abc/photos/def',expires=Date.now()+60000,key='test-key';const token=photoToken(name,expires,key);expect(validPhotoToken(name,expires,token,key)).toBe(true);expect(validPhotoToken('places/xyz/photos/def',expires,token,key)).toBe(false);expect(validPhotoToken(name,Date.now()-1,token,key)).toBe(false);});
});
