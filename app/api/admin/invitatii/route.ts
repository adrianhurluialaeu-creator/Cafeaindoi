import {createHash,timingSafeEqual} from "crypto";
import {NextRequest,NextResponse} from "next/server";
import {availableSlots,getSchedule} from "../../../../lib/schedule";
import {deleteInvitation,listInvitations,updateBooking,updateInvitationStatus,type InvitationStatus} from "../../../../lib/invitations";
export const runtime="nodejs";
export const dynamic="force-dynamic";
function authorized(req:NextRequest){
 const password=process.env.ADMIN_PASSWORD;
 const cookie=req.cookies.get("cafeaindoi_admin")?.value;
 if(!password||!cookie||!/^[a-f0-9]{64}$/.test(cookie))return false;
 const expected=createHash("sha256").update("cafeaindoi:"+password).digest("hex");
 return timingSafeEqual(Buffer.from(cookie),Buffer.from(expected));
}
export {authorized};
const validId=(id:unknown)=>typeof id==="string"&&/^[0-9a-f-]{36}$/i.test(id);
export async function GET(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{return NextResponse.json({invitations:await listInvitations()},{headers:{"Cache-Control":"private, no-store"}})}
 catch(error){console.error("[admin/invitatii] LIST_ERROR",error);return NextResponse.json({error:"Invitațiile nu pot fi încărcate."},{status:503})}
}
export async function PATCH(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const {id,status,bookingStatus,slotStart}=await req.json();
  if(bookingStatus!==undefined){
   if(!validId(id)||!["confirmed","declined"].includes(bookingStatus))return NextResponse.json({error:"Date invalide."},{status:400});
   const current=(await listInvitations()).find(x=>x.id===id);
   if(!current||!current.slotStart)return NextResponse.json({error:"Invitația nu are o oră propusă."},{status:404});
   if(bookingStatus==="confirmed"){
    const chosen=typeof slotStart==="string"&&slotStart?slotStart:current.slotStart;
    const schedule=await getSchedule();
    if(!(await availableSlots()).some(x=>x.start===chosen)&&!(current.bookingStatus==="confirmed"&&chosen===current.slotStart))return NextResponse.json({error:"Intervalul nu mai este disponibil."},{status:409});
    const invitation=await updateBooking(id,"confirmed",chosen,schedule.duration);return NextResponse.json({invitation});
   }
   return NextResponse.json({invitation:await updateBooking(id,"declined")});
  }
  if(!validId(id)||!["noua","in_conversatie","inchisa"].includes(status))return NextResponse.json({error:"Date invalide."},{status:400});
  const invitation=await updateInvitationStatus(id,status as InvitationStatus);
  return invitation?NextResponse.json({invitation}):NextResponse.json({error:"Invitația nu există."},{status:404});
 }catch(error){console.error("[admin/invitatii] UPDATE_ERROR",error);return NextResponse.json({error:"Actualizarea a eșuat."},{status:500})}
}
export async function DELETE(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 const id=req.nextUrl.searchParams.get("id");
 if(!validId(id))return NextResponse.json({error:"ID invalid."},{status:400});
 try{return await deleteInvitation(id!)?NextResponse.json({ok:true}):NextResponse.json({error:"Invitația nu există."},{status:404})}
 catch(error){console.error("[admin/invitatii] DELETE_ERROR",error);return NextResponse.json({error:"Ștergerea a eșuat."},{status:500})}
}
