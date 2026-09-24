import {createHmac,timingSafeEqual} from "node:crypto";

const secret=()=>process.env.PORTAL_SESSION_SECRET||process.env.ADMIN_PASSWORD||"";
const equal=(a:string,b:string)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)};

export function createPortalSession(invitationId:string){
 if(!secret())throw new Error("Secretul sesiunii nu este configurat.");
 const payload=Buffer.from(JSON.stringify({id:invitationId,exp:Date.now()+7*864e5})).toString("base64url"),signature=createHmac("sha256",secret()).update(payload).digest("base64url");
 return `${payload}.${signature}`;
}

export function verifyPortalSession(value?:string){
 if(!value||!secret())return null;
 const [payload,signature]=value.split(".");
 if(!payload||!signature)return null;
 const expected=createHmac("sha256",secret()).update(payload).digest("base64url");
 if(!equal(signature,expected))return null;
 try{const data=JSON.parse(Buffer.from(payload,"base64url").toString()) as {id:string;exp:number};return /^[0-9a-f-]{36}$/i.test(data.id)&&data.exp>Date.now()?data.id:null}catch{return null}
}
