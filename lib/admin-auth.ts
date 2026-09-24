import {createHmac,randomBytes,timingSafeEqual} from "crypto";
import type {NextRequest} from "next/server";

export const ADMIN_COOKIE="cafeaindoi_admin";
export const ADMIN_SESSION_SECONDS=8*60*60;

function secret(){return process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_PASSWORD||""}
function sign(payload:string){return createHmac("sha256",secret()).update(payload).digest("base64url")}

export function createAdminSession(){
 const payload=Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+ADMIN_SESSION_SECONDS,nonce:randomBytes(18).toString("base64url")})).toString("base64url");
 return `${payload}.${sign(payload)}`;
}

export function validAdminToken(token?:string){
 if(!secret()||!token)return false;
 const [payload,signature,...rest]=token.split(".");
 if(!payload||!signature||rest.length)return false;
 const expected=Buffer.from(sign(payload)),received=Buffer.from(signature);
 if(expected.length!==received.length||!timingSafeEqual(expected,received))return false;
 try{const parsed=JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));return typeof parsed.exp==="number"&&parsed.exp>Math.floor(Date.now()/1000)&&typeof parsed.nonce==="string"&&parsed.nonce.length>=16}catch{return false}
}

export function authorized(req:NextRequest){return validAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)}
