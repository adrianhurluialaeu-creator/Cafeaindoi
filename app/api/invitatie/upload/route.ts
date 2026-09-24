import {NextResponse} from "next/server";
import {consumeRateLimit,requestIp} from "../../../../lib/rate-limit";
import {createPendingMediaUpload,INVITATION_MEDIA_TYPES,MAX_INVITATION_MEDIA_BYTES} from "../../../../lib/invitation-media";

export const runtime="nodejs";
const origins=new Set(["https://www.cafeaindoi.eu","https://cafeaindoi.eu"]);

export async function POST(req:Request){
 const origin=req.headers.get("origin");
 if(origin&&!origins.has(origin))return NextResponse.json({error:"Cerere nepermisă."},{status:403});
 const limit=await consumeRateLimit("invitation-upload",requestIp(req),5,60_000,{failClosed:true});
 if(!limit.allowed)return NextResponse.json({error:"Prea multe încercări. Încearcă din nou peste un minut."},{status:429,headers:{"Retry-After":String(limit.retryAfter)}});
 try{
  const body=await req.json(),contentType=String(body?.contentType||""),size=Number(body?.size);
  if(!INVITATION_MEDIA_TYPES.has(contentType)||!Number.isInteger(size)||size<4||size>MAX_INVITATION_MEDIA_BYTES)return NextResponse.json({error:"Materialul live este invalid sau depășește 4 MB."},{status:400});
  return NextResponse.json(await createPendingMediaUpload(contentType),{headers:{"Cache-Control":"no-store"}});
 }catch(error){console.error("[invitation-upload] CREATE_ERROR",error);return NextResponse.json({error:"Încărcarea nu poate fi pregătită momentan."},{status:503})}
}
