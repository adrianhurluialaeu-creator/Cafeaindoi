import {NextRequest,NextResponse} from "next/server";
import {escapeHtml,sanitizeInboundHtml,verifyWebhookSignature} from "../../../../lib/inbound-security";

const API="https://api.resend.com";
const CONTACT="contact@cafeaindoi.eu";

export async function POST(req:NextRequest){
 const secret=process.env.RESEND_WEBHOOK_SECRET,apiKey=process.env.RESEND_API_KEY_V2||process.env.RESEND_API_KEY,target=process.env.INVITATION_TO_EMAIL;
 if(!secret||!apiKey||!target)return NextResponse.json({error:"Missing server configuration"},{status:500});
 const raw=await req.text();
 if(!verifyWebhookSignature(raw,{id:req.headers.get("svix-id"),timestamp:req.headers.get("svix-timestamp"),signature:req.headers.get("svix-signature")},secret))return NextResponse.json({error:"Invalid signature"},{status:401});
 let event:any;try{event=JSON.parse(raw)}catch{return NextResponse.json({error:"Invalid payload"},{status:400})}
 if(event.type!=="email.received")return NextResponse.json({ok:true});
 const d=event.data||{},tos:Array<string>=d.to||[];
 if(!tos.some((x:string)=>x.toLowerCase().includes(CONTACT)))return NextResponse.json({ok:true});
 const r=await fetch(`${API}/emails/receiving/${encodeURIComponent(d.email_id)}`,{headers:{Authorization:`Bearer ${apiKey}`}});
 if(!r.ok)return NextResponse.json({error:"Could not retrieve inbound email"},{status:502});
 const mail=await r.json();
 const text=String(mail.text||"");
 const html=String(mail.html||"");
 const clean=html?sanitizeInboundHtml(html):text.slice(0,50000);
 const body=`<pre style="white-space:pre-wrap;font-family:system-ui">${escapeHtml(clean)}</pre>`;
 const sender=String(d.from||"").slice(0,320),subject=String(d.subject||"(fără subiect)").replace(/[\r\n]+/g," ").slice(0,300);
 const send=await fetch(`${API}/emails`,{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json","Idempotency-Key":`inbound/${d.email_id}`},body:JSON.stringify({from:"Cafea în Doi <invitatii@cafeaindoi.eu>",to:[target],reply_to:sender,subject:`[Contact Cafea în Doi] ${subject}`,html:`<p><strong>Mesaj primit la contact@cafeaindoi.eu</strong></p><p><strong>De la:</strong> ${escapeHtml(sender)}</p><hr/>${body}`})});
 if(!send.ok)return NextResponse.json({error:"Forward failed"},{status:502});
 return NextResponse.json({ok:true});
}
