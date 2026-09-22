import {NextRequest,NextResponse} from "next/server";
import {listApprovedForArticle,savePendingOpinion} from "../../../lib/opinions";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const WINDOW=60_000;
const MAX=4;
const hits=new Map<string,{n:number,t:number}>();
const safe=(s:string)=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]||c));

export async function GET(req:NextRequest){
 const article=req.nextUrl.searchParams.get("article")||"";
 if(!/^\/(blog|declaratii)\/[a-z0-9-]+$/.test(article))return NextResponse.json({opinions:[]});
 try{
  const opinions=await listApprovedForArticle(article);
  return NextResponse.json({opinions:opinions.map(({id,prenume,opinia,createdAt,approvedAt})=>({id,prenume,opinia,createdAt,approvedAt}))},{headers:{"Cache-Control":"no-store"}});
 }catch(e){
  console.error("[opinie] LIST_ERROR",e);
  return NextResponse.json({opinions:[]},{headers:{"Cache-Control":"no-store"}});
 }
}

export async function POST(req:NextRequest){
 try{
  const ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
  const now=Date.now(),hit=hits.get(ip);
  if(hit&&now-hit.t<WINDOW&&hit.n>=MAX)return NextResponse.json({ok:false,error:"Prea multe încercări. Încearcă din nou peste un minut."},{status:429});
  hits.set(ip,!hit||now-hit.t>=WINDOW?{n:1,t:now}:{n:hit.n+1,t:hit.t});

  const origin=req.headers.get("origin");
  const allowed=new Set(["https://www.cafeaindoi.eu","https://cafeaindoi.eu"]);
  if(origin&&!allowed.has(origin))return NextResponse.json({ok:false,error:"Cerere nepermisă."},{status:403});

  const d=await req.formData();
  if(String(d.get("website")||"").trim())return NextResponse.json({ok:true});

  const prenume=String(d.get("prenume")||"").trim().slice(0,80);
  const opinia=String(d.get("opinia")||"").trim().slice(0,3000);
  const article=String(d.get("article")||"").trim().slice(0,220);
  const articleTitle=String(d.get("articleTitle")||"").trim().slice(0,220);
  const publishOk=d.get("publishOk")==="on";
  if(!prenume||opinia.length<3||!publishOk||!/^\/(blog|declaratii)\/[a-z0-9-]+$/.test(article)){
   return NextResponse.json({ok:false,error:"Verifică toate câmpurile obligatorii."},{status:400});
  }

  let record;
  try{
   record=await savePendingOpinion({prenume,opinia,article,articleTitle});
  }catch(e){
   console.error("[opinie] STORAGE_ERROR",e);
   return NextResponse.json({ok:false,error:"Stocarea opiniilor nu este configurată încă."},{status:503});
  }

  const key=process.env.RESEND_API_KEY_V2||process.env.RESEND_API_KEY;
  const to=process.env.OPINION_TO_EMAIL||process.env.INVITATION_TO_EMAIL;
  const from=process.env.OPINION_FROM_EMAIL||process.env.INVITATION_FROM_EMAIL||"Cafea în Doi <onboarding@resend.dev>";
  if(key&&to){
   const url=`https://www.cafeaindoi.eu${article}`;
   const subject=`Cafea în Doi — opinie nouă pentru moderare`;
   const text=[`Articol: ${articleTitle||article}`,`URL: ${url}`,`Prenume: ${prenume}`,"","Opinia:",opinia,"",`ID: ${record.id}`].join("\n");
   const html=`<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#33241f"><h2>Opinie nouă pentru moderare</h2><p><strong>Articol:</strong> ${safe(articleTitle||article)}</p><p><a href="${url}">${url}</a></p><p><strong>Prenume:</strong> ${safe(prenume)}</p><p><strong>Opinia:</strong><br>${safe(opinia).replace(/\n/g,"<br>")}</p><p><small>ID: ${record.id}</small></p></div>`;
   const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({from,to:[to],subject,text,html})});
   if(!r.ok)console.error("[opinie] RESEND_ERROR",await r.text());
  }

  return NextResponse.json({ok:true,id:record.id});
 }catch(e){
  console.error("[opinie] INVALID_REQUEST",e);
  return NextResponse.json({ok:false,error:"Cerere invalidă."},{status:400});
 }
}
