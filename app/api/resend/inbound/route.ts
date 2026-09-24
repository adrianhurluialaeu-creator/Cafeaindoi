import {NextRequest,NextResponse} from "next/server";
import crypto from "node:crypto";

const API="https://api.resend.com";
const CONTACT="contact@cafeaindoi.eu";

function safe(s:string){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));}
function plainText(html:string){
 return html
  .replace(/<\s*(br|\/p|\/div|\/li|\/tr|h[1-6])\b[^>]*>/gi,"\n")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"")
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"")
  .replace(/<[^>]+>/g,"")
  .replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&quot;/gi,'"').replace(/&#(?:39|x27);/gi,"'")
  .replace(/\n{3,}/g,"\n\n").trim().slice(0,50000);
}
function verify(raw:string,req:NextRequest,secret:string){
 const id=req.headers.get("svix-id"),ts=req.headers.get("svix-timestamp"),sig=req.headers.get("svix-signature");
 if(!id||!ts||!sig||!secret.startsWith("whsec_"))return false;
 const timestamp=Number(ts);
 if(!Number.isFinite(timestamp)||Math.abs(Date.now()/1000-timestamp)>300)return false;
 const key=Buffer.from(secret.slice(6),"base64");
 const expected=crypto.createHmac("sha256",key).update(`${id}.${ts}.${raw}`).digest("base64");
 return sig.split(" ").some(v=>{const x=v.includes(",")?v.split(",")[1]:v;try{return crypto.timingSafeEqual(Buffer.from(x),Buffer.from(expected))}catch{return false}});
}
export async function POST(req:NextRequest){
 const secret=process.env.RESEND_WEBHOOK_SECRET,apiKey=process.env.RESEND_API_KEY_V2||process.env.RESEND_API_KEY,target=process.env.INVITATION_TO_EMAIL;
 if(!secret||!apiKey||!target)return NextResponse.json({error:"Missing server configuration"},{status:500});
 const raw=await req.text();
 if(!verify(raw,req,secret))return NextResponse.json({error:"Invalid signature"},{status:401});
 let event:any;try{event=JSON.parse(raw)}catch{return NextResponse.json({error:"Invalid payload"},{status:400})}
 if(event.type!=="email.received")return NextResponse.json({ok:true});
 const d=event.data||{},tos:Array<string>=d.to||[];
 if(!tos.some((x:string)=>x.toLowerCase().includes(CONTACT)))return NextResponse.json({ok:true});
 const r=await fetch(`${API}/emails/receiving/${encodeURIComponent(d.email_id)}`,{headers:{Authorization:`Bearer ${apiKey}`}});
 if(!r.ok)return NextResponse.json({error:"Could not retrieve inbound email"},{status:502});
 const mail=await r.json();
 const text=String(mail.text||"");
 const html=String(mail.html||"");
 const clean=html?plainText(html):text.slice(0,50000);
 const body=`<pre style="white-space:pre-wrap;font-family:system-ui">${safe(clean)}</pre>`;
 const sender=String(d.from||"").slice(0,320),subject=String(d.subject||"(fără subiect)").replace(/[\r\n]+/g," ").slice(0,300);
 const send=await fetch(`${API}/emails`,{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json","Idempotency-Key":`inbound/${d.email_id}`},body:JSON.stringify({from:"Cafea în Doi <invitatii@cafeaindoi.eu>",to:[target],reply_to:sender,subject:`[Contact Cafea în Doi] ${subject}`,html:`<p><strong>Mesaj primit la contact@cafeaindoi.eu</strong></p><p><strong>De la:</strong> ${safe(sender)}</p><hr/>${body}`})});
 if(!send.ok)return NextResponse.json({error:"Forward failed"},{status:502});
 return NextResponse.json({ok:true});
}
