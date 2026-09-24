import {NextRequest,NextResponse} from "next/server";
import {createContactMessage,getContactSettings,validateContactInput} from "../../../lib/contact";
import {getAdminSettings} from "../../../lib/admin-settings";
import {consumeRateLimit,requestIp} from "../../../lib/rate-limit";
import {sendPush} from "../../../lib/push";

export const runtime="nodejs";export const dynamic="force-dynamic";
const safe=(value:string)=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]||char));
export async function POST(req:NextRequest){
 const origin=req.headers.get("origin"),allowed=new Set([req.nextUrl.origin,"https://www.cafeaindoi.eu","https://cafeaindoi.eu"]);if(origin&&!allowed.has(origin))return NextResponse.json({error:"Cerere nepermisă."},{status:403});
 const limit=await consumeRateLimit("contact",requestIp(req),5,24*60*60_000,{failClosed:true});if(!limit.allowed)return NextResponse.json({error:"Ai trimis prea multe mesaje. Încearcă din nou mai târziu."},{status:429,headers:{"Retry-After":String(limit.retryAfter)}});
 try{const input=validateContactInput(await req.json());if(input&&"honeypot" in input)return NextResponse.json({ok:true});if(!input)return NextResponse.json({error:"Verifică toate câmpurile obligatorii."},{status:400});const [contactSettings,adminSettings]=await Promise.all([getContactSettings(),getAdminSettings()]);if(!contactSettings.enabled)return NextResponse.json({error:"Formularul de contact este închis momentan."},{status:503});const saved=await createContactMessage(input);
  if(adminSettings.notifications.push)sendPush("Mesaj nou de contact",`${input.name}: ${input.subject}`,{url:"/admin/contact",tag:`contact-${saved.id}`}).catch(error=>console.error("[contact] PUSH_ERROR",error));
  if(adminSettings.notifications.email){const key=process.env.RESEND_API_KEY_V2||process.env.RESEND_API_KEY,to=contactSettings.email||adminSettings.general.contactEmail||process.env.INVITATION_TO_EMAIL,from=process.env.INVITATION_FROM_EMAIL||"Cafea în Doi <onboarding@resend.dev>";if(key&&to){const adminUrl="https://www.cafeaindoi.eu/admin/contact";fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json","Idempotency-Key":`contact-${saved.id}`},body:JSON.stringify({from,to:[to],reply_to:input.email,subject:`Mesaj contact: ${input.subject}`,text:`De la: ${input.name} <${input.email}>\nSubiect: ${input.subject}\n\n${input.message}\n\n${adminUrl}`,html:`<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#33241f"><h2>Mesaj nou de contact</h2><p><strong>De la:</strong> ${safe(input.name)} &lt;${safe(input.email)}&gt;</p><p><strong>Subiect:</strong> ${safe(input.subject)}</p><p style="white-space:pre-wrap">${safe(input.message)}</p><p><a href="${adminUrl}">Deschide în Admin</a></p></div>`})}).then(async response=>{if(!response.ok)console.error("[contact] EMAIL_ERROR",await response.text())}).catch(error=>console.error("[contact] EMAIL_NETWORK_ERROR",error))}}
  return NextResponse.json({ok:true},{status:201});
 }catch(error){console.error("[contact] CREATE_ERROR",error);return NextResponse.json({error:"Mesajul nu a putut fi trimis momentan."},{status:503})}
}
