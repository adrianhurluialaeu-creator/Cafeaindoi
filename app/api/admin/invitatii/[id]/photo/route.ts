import {NextRequest,NextResponse} from "next/server";
import {authorized} from "../../route";
import {readInvitation,readInvitationPhoto} from "../../../../../../lib/invitations";
export const runtime="nodejs";
export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"Invalid id"},{status:400});
 try{
  const record=await readInvitation(id);
  if(!record)return NextResponse.json({error:"Not found"},{status:404});
  const photo=await readInvitationPhoto(id);
  if(!photo||photo.statusCode!==200)return NextResponse.json({error:"Not found"},{status:404});
  return new NextResponse(photo.stream,{headers:{"Content-Type":record.photoType,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Disposition":"inline"}});
 }catch(error){console.error("[admin/invitatii] PHOTO_ERROR",error);return NextResponse.json({error:"Fotografia nu poate fi încărcată."},{status:503})}
}
