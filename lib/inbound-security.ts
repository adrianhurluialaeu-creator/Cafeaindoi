import {createHmac,timingSafeEqual} from "node:crypto";

export type WebhookSignature={id:string|null;timestamp:string|null;signature:string|null};

export function escapeHtml(value:string){
 return value.replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character]!));
}

export function sanitizeInboundHtml(html:string){
 return html
  .replace(/<\s*(br|\/p|\/div|\/li|\/tr|h[1-6])\b[^>]*>/gi,"\n")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"")
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"")
  .replace(/<[^>]+>/g,"")
  .replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&quot;/gi,'"').replace(/&#(?:39|x27);/gi,"'")
  .replace(/\n{3,}/g,"\n\n").trim().slice(0,50000);
}

export function verifyWebhookSignature(raw:string,headers:WebhookSignature,secret:string,now=Date.now()){
 const {id,timestamp,signature}=headers;
 if(!id||!timestamp||!signature||!secret.startsWith("whsec_"))return false;
 const seconds=Number(timestamp);
 if(!Number.isFinite(seconds)||Math.abs(now/1000-seconds)>300)return false;
 let key:Buffer;try{key=Buffer.from(secret.slice(6),"base64")}catch{return false}
 const expected=createHmac("sha256",key).update(`${id}.${timestamp}.${raw}`).digest("base64");
 return signature.split(" ").some(value=>{
  const candidate=value.includes(",")?value.split(",")[1]:value;
  try{const received=Buffer.from(candidate);return received.length===Buffer.byteLength(expected)&&timingSafeEqual(received,Buffer.from(expected))}catch{return false}
 });
}
