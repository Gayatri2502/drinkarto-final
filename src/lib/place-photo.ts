import {createHmac,timingSafeEqual} from 'node:crypto';
export function photoToken(name:string,expires:number,key:string){return createHmac('sha256',key).update(`${name}|${expires}`).digest('hex');}
export function validPhotoToken(name:string,expires:number,token:string,key:string){if(!/^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/.test(name)||expires<Date.now()||expires>Date.now()+3_600_000||!/^[a-f0-9]{64}$/.test(token))return false;return timingSafeEqual(Buffer.from(token),Buffer.from(photoToken(name,expires,key)));}
