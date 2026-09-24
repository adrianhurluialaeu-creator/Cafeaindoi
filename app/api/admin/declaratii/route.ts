import {NextRequest,NextResponse} from "next/server";
import {authorized} from "../../../../lib/admin-auth";
import {createDeclaration,deleteDeclaration,listDeclarations,publishDeclaration,unpublishDeclaration,updateDeclaration} from "../../../../lib/declarations";

export const runtime="nodejs";
export const dynamic="force-dynamic";

function declarationImage(value:unknown){
 const imageUrl=String(value||"").trim().slice(0,1000);
 if(!imageUrl)return "";
 try{
  const url=new URL(imageUrl);
  if(url.protocol!=="https:"||!["cafeaindoi.eu","www.cafeaindoi.eu"].includes(url.hostname.toLowerCase()))return null;
  return url.toString();
 }catch{return null}
}

export async function GET(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const [drafts,published]=await Promise.all([listDeclarations("draft"),listDeclarations("published")]);
  return NextResponse.json({drafts,published},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("[admin/declaratii] GET_ERROR",e);return NextResponse.json({error:"Nu s-au putut încărca declarațiile."},{status:500})}
}

export async function POST(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const b=await req.json();
  const title=String(b.title||"").trim().slice(0,180);
  const text=String(b.text||"").trim().slice(0,12000);
  const category=String(b.category||"Dragoste").trim().slice(0,60);
  const imageUrl=declarationImage(b.imageUrl);
  const publish=b.publish===true;
  if(title.length<3||text.length<10)return NextResponse.json({error:"Titlul și textul sunt obligatorii."},{status:400});
  if(imageUrl===null)return NextResponse.json({error:"Imaginea trebuie găzduită pe cafeaindoi.eu și să folosească HTTPS."},{status:400});
  const declaration=await createDeclaration({title,text,category,imageUrl:imageUrl||undefined,status:publish?"published":"draft"});
  return NextResponse.json({ok:true,declaration});
 }catch(e){console.error("[admin/declaratii] POST_ERROR",e);return NextResponse.json({error:"Declarația nu a putut fi creată."},{status:500})}
}

export async function PATCH(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const b=await req.json();
  const id=String(b.id||"");
  const action=String(b.action||"update");
  if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"ID invalid."},{status:400});
  if(action==="publish")return NextResponse.json({ok:true,declaration:await publishDeclaration(id)});
  if(action==="unpublish")return NextResponse.json({ok:true,declaration:await unpublishDeclaration(id)});
  if(action==="update"){
   const input:any={};
   if(typeof b.title==="string")input.title=b.title.trim().slice(0,180);
   if(typeof b.text==="string")input.text=b.text.trim().slice(0,12000);
   if(typeof b.category==="string")input.category=b.category.trim().slice(0,60);
   if(typeof b.imageUrl==="string"){
    const imageUrl=declarationImage(b.imageUrl);
    if(imageUrl===null)return NextResponse.json({error:"Imaginea trebuie găzduită pe cafeaindoi.eu și să folosească HTTPS."},{status:400});
    input.imageUrl=imageUrl||undefined;
   }
   if(input.title!==undefined&&input.title.length<3)return NextResponse.json({error:"Titlul este prea scurt."},{status:400});
   if(input.text!==undefined&&input.text.length<10)return NextResponse.json({error:"Textul este prea scurt."},{status:400});
   return NextResponse.json({ok:true,declaration:await updateDeclaration(id,input)});
  }
  return NextResponse.json({error:"Acțiune invalidă."},{status:400});
 }catch(e){console.error("[admin/declaratii] PATCH_ERROR",e);return NextResponse.json({error:"Operațiunea nu a reușit."},{status:500})}
}

export async function DELETE(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const id=req.nextUrl.searchParams.get("id")||"";
  if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"ID invalid."},{status:400});
  await deleteDeclaration(id);
  return NextResponse.json({ok:true});
 }catch(e){console.error("[admin/declaratii] DELETE_ERROR",e);return NextResponse.json({error:"Declarația nu a putut fi ștearsă."},{status:500})}
}
