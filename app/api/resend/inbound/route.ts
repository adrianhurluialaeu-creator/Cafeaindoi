import {NextRequest,NextResponse} from "next/server";
import crypto from "node:crypto";

const API="https://api.resend.com";
const CONTACT="contact@cafeaindoi.eu";

function safe(s:string){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));}
function verify(raw:string,req:NextRequest,secret:string){
 const id=req.headers.get("svix-id"),ts=req.headers.get("svix-timestamp"),sig=req.headers.get("svix-signature");
 if(!id||!ts||!sig||!secret.startsWith("whsec_"))return false;
 const key=Buffer.from(secret.slice(6),"base64");
 const expected=crypto.createHmac("sha256",key).update(`${id}.${ts}.${raw}`).digest("base64");
 return sig.split(" ").some(v=>{const x=v.includes(",")?v.split(",")[1]:v;try{return crypto.timingSafeEqual(Buffer.from(x),Buffer.from(expected))}catch{return false}});
}
export async function POST(req:NextRequest){
 const secret=process.env.RESEND_WEBHOOK_SECRET,apiKey=process.env.RESEND_API_KEY_V2||process.env.RESEND_API_KEY;
 if(!secret||!apiKey)return NextResponse.json({error:"Missing server configuration"},{status:500});
 const raw=await req.text();
 if(!verify(raw,req,secret))return NextResponse.json({error:"Invalid signature"},{status:401});
 const event=JSON.parse(raw);
 if(event.type!=="email.received")return NextResponse.json({ok:true});
 const d=event.data||{},tos:Array<string>=d.to||[];
 if(!tos.some((x:string)=>x.toLowerCase().includes(CONTACT)))return NextResponse.json({ok:true});
 const r=await fetch(`${API}/emails/receiving/${encodeURIComponent(d.email_id)}`,{headers:{Authorization:`Bearer ${apiKey}`}});
 if(!r.ok)return NextResponse.json({error:"Could not retrieve inbound email"},{status:502});
 const mail=await r.json();
 const text=String(mail.text||"");
 const html=String(mail.html||"");
 const body=html||`<pre style="white-space:pre-wrap;font-family:system-ui">${safe(text)}</pre>`;
 const send=await fetch(`${API}/emails`,{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json","Idempotency-Key":`inbound/${d.email_id}`},body:JSON.stringify({from:"Cafea în Doi <invitatii@cafeaindoi.eu>",to:[process.env.INVITATION_TO_EMAIL],reply_to:d.from,subject:`[Contact Cafea în Doi] ${d.subject||"(fără subiect)"}`,html:`<p><strong>Mesaj primit la contact@cafeaindoi.eu</strong></p><p><strong>De la:</strong> ${safe(String(d.from||""))}</p><hr/>${body}`})});
 if(!send.ok)return NextResponse.json({error:"Forward failed"},{status:502});
 return NextResponse.json({ok:true});
}