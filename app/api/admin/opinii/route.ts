import {NextRequest,NextResponse} from "next/server";
import {authorized} from "../../../../lib/admin-auth";
import {approveOpinion,deleteApprovedOpinion,listOpinions,rejectOpinion,unpublishOpinion} from "../../../../lib/opinions";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const [pending,approved]=await Promise.all([listOpinions("pending"),listOpinions("approved")]);
  return NextResponse.json({pending,approved},{headers:{"Cache-Control":"no-store"}});
 }catch(e){
  console.error("[admin/opinii] LIST_ERROR",e);
  return NextResponse.json({error:"Stocarea opiniilor nu este configurată."},{status:503});
 }
}

export async function PATCH(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const body=await req.json();
  const id=String(body.id||"");
  const action=String(body.action||"");
  if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"Invalid id"},{status:400});
  if(action==="approve")await approveOpinion(id);
  else if(action==="reject")await rejectOpinion(id);
  else if(action==="delete")await deleteApprovedOpinion(id);
  else if(action==="unpublish")await unpublishOpinion(id);
  else return NextResponse.json({error:"Invalid action"},{status:400});
  return NextResponse.json({ok:true});
 }catch(e){
  console.error("[admin/opinii] ACTION_ERROR",e);
  return NextResponse.json({error:"Operațiunea nu a reușit."},{status:500});
 }
}
