import {NextRequest,NextResponse} from "next/server";
import {countDeclarationLikes,getPublishedDeclarationBySlug,listDeclarations,setDeclarationLike} from "../../../lib/declarations";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const WINDOW=60_000;
const MAX=12;
const hits=new Map<string,{n:number,t:number}>();

export async function GET(req:NextRequest){
 try{
  const slug=req.nextUrl.searchParams.get("slug");
  if(slug){
   const declaration=await getPublishedDeclarationBySlug(slug);
   if(!declaration)return NextResponse.json({error:"Not found"},{status:404});
   const likes=await countDeclarationLikes(slug);
   return NextResponse.json({declaration,likes},{headers:{"Cache-Control":"no-store"}});
  }
  const declarations=await listDeclarations("published");
  const rows=await Promise.all(declarations.map(async d=>({...d,likes:await countDeclarationLikes(d.slug)})));
  return NextResponse.json({declarations:rows},{headers:{"Cache-Control":"no-store"}});
 }catch(e){
  console.error("[declaratii] GET_ERROR",e);
  return NextResponse.json({error:"Nu s-au putut încărca declarațiile."},{status:500});
 }
}

export async function POST(req:NextRequest){
 try{
  const ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
  const now=Date.now(),hit=hits.get(ip);
  if(hit&&now-hit.t<WINDOW&&hit.n>=MAX)return NextResponse.json({error:"Prea multe încercări."},{status:429});
  hits.set(ip,!hit||now-hit.t>=WINDOW?{n:1,t:now}:{n:hit.n+1,t:hit.t});
  const body=await req.json();
  const slug=String(body.slug||"").slice(0,120);
  const visitorId=String(body.visitorId||"").slice(0,64);
  const liked=body.liked===true;
  if(!/^[a-z0-9-]+$/.test(slug)||!/^[a-zA-Z0-9_-]{12,64}$/.test(visitorId))return NextResponse.json({error:"Cerere invalidă."},{status:400});
  const d=await getPublishedDeclarationBySlug(slug);
  if(!d)return NextResponse.json({error:"Not found"},{status:404});
  const likes=await setDeclarationLike(slug,visitorId,liked);
  return NextResponse.json({ok:true,likes,liked});
 }catch(e){
  console.error("[declaratii] LIKE_ERROR",e);
  return NextResponse.json({error:"Aprecierea nu a putut fi salvată."},{status:500});
 }
}
