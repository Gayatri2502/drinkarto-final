import {beforeEach,describe,it,expect,vi} from 'vitest';
const mocks=vi.hoisted(()=>({actor:vi.fn(),reviewer:vi.fn(),execute:vi.fn(),query:vi.fn(),transaction:vi.fn()}));
vi.mock('../src/lib/auth',()=>({context:mocks.actor,checkOrigin:vi.fn(),throttle:vi.fn()}));
vi.mock('../src/lib/db',()=>({db:{$executeRaw:mocks.execute,$queryRaw:mocks.query,$transaction:mocks.transaction}}));
vi.mock('../src/lib/price-review',()=>({platformReviewer:mocks.reviewer}));
import {GET,POST} from '../src/app/api/community/[action]/route';
import {HttpError} from '../src/lib/policy';
const route=(action:string)=>({params:Promise.resolve({action})});
describe('community authorization',()=>{
 beforeEach(()=>{vi.clearAllMocks();mocks.actor.mockResolvedValue({userId:'owner-a',user:{name:'A'}});mocks.reviewer.mockReturnValue(false);});
 it('requires a session for profile data',async()=>{mocks.actor.mockRejectedValue(new HttpError(401,'Sign in required'));const r=await GET(new Request('https://drinkarto.vercel.app/api/community/profile'),route('profile'));expect(r.status).toBe(401);expect(mocks.query).not.toHaveBeenCalled();});
 it('does not give tenant owners moderation access',async()=>{const r=await POST(new Request('https://drinkarto.vercel.app/api/community/moderate',{method:'POST',body:JSON.stringify({id:'fake',approve:true})}),route('moderate'));expect(r.status).toBe(403);expect(mocks.transaction).not.toHaveBeenCalled();});
 it('rejects photos belonging to another user',async()=>{const r=await POST(new Request('https://drinkarto.vercel.app/api/community/reviews',{method:'POST',body:JSON.stringify({placeId:'p',placeName:'Example venue',rating:1,body:'A detailed critical first-hand review.',photoPath:'owner-b/photo.jpg'})}),route('reviews'));expect(r.status).toBe(403);expect(mocks.execute).not.toHaveBeenCalled();});
 it('accepts critical reviews without granting immediate points',async()=>{mocks.execute.mockResolvedValue(1);const r=await POST(new Request('https://drinkarto.vercel.app/api/community/reviews',{method:'POST',body:JSON.stringify({placeId:'p',placeName:'Example venue',rating:1,body:'A detailed critical first-hand review.'})}),route('reviews'));expect(r.status).toBe(201);expect(mocks.transaction).not.toHaveBeenCalled();});
});
