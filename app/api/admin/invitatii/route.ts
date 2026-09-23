import {createHash,timingSafeEqual} from "crypto";
import {NextRequest,NextResponse} from "next/server";
import {availableSlots,getSchedule} from "../../../../lib/schedule";
import {sendConfirmationEmail} from "../../../../lib/confirmation-email";
import {sendMeetingLocationEmail} from "../../../../lib/meeting-email";
import {deleteInvitation,listInvitations,markConfirmationSent,readInvitation,updateBooking,updateInvitationStatus,updateJourney,type InvitationStatus,type JourneyStage,type PhysicalMeeting} from "../../../../lib/invitations";
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
  const {id,status,bookingStatus,slotStart,notify,journeyStage,onlineSessions,physicalMeeting,shareLocation}=await req.json();
  if(journeyStage!==undefined||onlineSessions!==undefined||physicalMeeting!==undefined||shareLocation===true){
   if(!validId(id))return NextResponse.json({error:"ID invalid."},{status:400});
   const stages=["invitatie","online","eu_la_ea","ea_la_mine"];
   if(journeyStage!==undefined&&!stages.includes(journeyStage))return NextResponse.json({error:"Etapă invalidă."},{status:400});
   if(onlineSessions!==undefined&&(!Number.isInteger(onlineSessions)||onlineSessions<0||onlineSessions>999))return NextResponse.json({error:"Număr de ședințe invalid."},{status:400});
   let meeting:PhysicalMeeting|undefined;
   if(physicalMeeting!==undefined){
    if(!physicalMeeting||!["eu_la_ea","ea_la_mine"].includes(physicalMeeting.direction)||!["propusa","confirmata","finalizata","anulata"].includes(physicalMeeting.status))return NextResponse.json({error:"Datele întâlnirii sunt invalide."},{status:400});
    const clean=(value:unknown,max:number)=>String(value||"").trim().slice(0,max);
    meeting={direction:physicalMeeting.direction,status:physicalMeeting.status,city:clean(physicalMeeting.city,120),place:clean(physicalMeeting.place,160)||undefined,address:clean(physicalMeeting.address,240)||undefined,mapUrl:clean(physicalMeeting.mapUrl,500)||undefined,dateTime:clean(physicalMeeting.dateTime,40)||undefined,note:clean(physicalMeeting.note,500)||undefined,locationSharedAt:physicalMeeting.locationSharedAt};
    if(!meeting.city)return NextResponse.json({error:"Completează orașul întâlnirii."},{status:400});
    if(meeting.mapUrl&&!/^https:\/\/(maps\.app\.goo\.gl|www\.google\.[^/]+\/maps|maps\.google\.[^/]+)/i.test(meeting.mapUrl))return NextResponse.json({error:"Folosește un link Google Maps valid."},{status:400});
   }
   let invitation=await updateJourney(id,{...(journeyStage!==undefined?{journeyStage:journeyStage as JourneyStage}:{}),...(onlineSessions!==undefined?{onlineSessions}:{}),...(meeting?{physicalMeeting:meeting}:{})});
   if(!invitation)return NextResponse.json({error:"Invitația nu există."},{status:404});
   if(shareLocation===true){
    try{await sendMeetingLocationEmail(invitation);invitation=await updateJourney(id,{physicalMeeting:{...invitation.physicalMeeting!,locationSharedAt:new Date().toISOString()}})}
    catch(error){return NextResponse.json({error:(error as Error).message},{status:409})}
   }
   return NextResponse.json({invitation});
  }
  if(notify===true){
   if(!validId(id))return NextResponse.json({error:"ID invalid."},{status:400});
   const current=(await listInvitations()).find(x=>x.id===id);
   if(!current||current.bookingStatus!=="confirmed")return NextResponse.json({error:"Confirmă mai întâi întâlnirea."},{status:409});
   if(!current.email)return NextResponse.json({error:"Invitația nu are adresă de email."},{status:409});
   try{await sendConfirmationEmail(current);const invitation=await markConfirmationSent(id);return NextResponse.json({invitation})}
   catch(error){console.error("[admin/invitatii] EMAIL_ERROR",error);return NextResponse.json({error:(error as Error).message},{status:502})}
  }
  if(bookingStatus!==undefined){
   if(!validId(id)||!["confirmed","declined"].includes(bookingStatus))return NextResponse.json({error:"Date invalide."},{status:400});
   const current=(await listInvitations()).find(x=>x.id===id);
   if(!current||!current.slotStart)return NextResponse.json({error:"Invitația nu are o oră propusă."},{status:404});
   if(bookingStatus==="confirmed"){
    const chosen=typeof slotStart==="string"&&slotStart?slotStart:current.slotStart;
    const schedule=await getSchedule();
    if(!(await availableSlots()).some(x=>x.start===chosen)&&!(current.bookingStatus==="confirmed"&&chosen===current.slotStart))return NextResponse.json({error:"Intervalul nu mai este disponibil."},{status:409});
    const invitation=await updateBooking(id,"confirmed",chosen,schedule.duration);
    if(!invitation)return NextResponse.json({error:"Invitația nu există."},{status:404});
    const warnings:string[]=[];
    if(!invitation.confirmationSentAt){
     if(!invitation.email)warnings.push("Invitația nu are adresă de email.");
     else try{await sendConfirmationEmail(invitation);await markConfirmationSent(id)}
     catch(error){console.error("[admin/invitatii] EMAIL_ERROR",error);warnings.push("Emailul nu a plecat. Folosește «Retrimite emailul».")}
    }
    return NextResponse.json({invitation:await readInvitation(id),notificationWarning:warnings.join(" ")});
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
