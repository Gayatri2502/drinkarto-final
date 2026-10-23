import {describe,it,expect} from 'vitest';
import {communityScore,distanceKm,occasionChoice} from '../src/lib/discovery';
describe('LocalPour recommendation safeguards',()=>{
 it('uses alcohol-free choices when driving regardless of taste',()=>expect(occasionChoice(true,'Anniversary','Oak & smoke').category).toBe('Zero-proof'));
 it('does not prescribe alcohol for distress',()=>expect(occasionChoice(false,'Feeling low','Botanical').alcoholFree).toBe(true));
 it('does not rank a single perfect review above a sustained strong record',()=>expect(communityScore(1,5)).toBeLessThan(communityScore(30,4.5)));
 it('uses a neutral prior without reviews',()=>expect(communityScore(0,0)).toBe(3.5));
 it('computes distance in kilometres',()=>{expect(distanceKm({lat:0,lng:0},{lat:0,lng:0})).toBe(0);expect(distanceKm({lat:0,lng:0},{lat:1,lng:0})).toBeCloseTo(111.195,2);});
});
