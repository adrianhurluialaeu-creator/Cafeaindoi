import {deleteConversation} from "./conversation";
import {createSupabaseAdmin} from "./supabase";

export type InvitationStatus="noua"|"in_conversatie"|"inchisa";
export type JourneyStage="invitatie"|"online"|"eu_la_ea"|"ea_la_mine"|"experienta";
export type Challenge={id:string;proposer:"adrian"|"ea";title:string;description?:string;status:"propusa"|"acceptata"|"finalizata"|"refuzata";createdAt:string};
export type PhysicalMeeting={direction:"eu_la_ea"|"ea_la_mine";status:"propusa"|"confirmata"|"finalizata"|"anulata";city:string;place?:string;address?:string;mapUrl?:string;dateTime?:string;note?:string;locationSharedAt?:string};
export type SharedExperience={status:"propusa"|"acceptata"|"planificata"|"finalizata"|"anulata";type:string;destination?:string;startDate?:string;endDate?:string;budget?:string;note?:string};
export type Invitation={id:string;prenume:string;varsta:number;localitate:string;tara:string;email?:string;despre:string;createdAt:string;status:InvitationStatus;photoType?:string;slotStart?:string;slotDuration?:number;bookingStatus?:"pending"|"confirmed"|"declined";confirmationSentAt?:string;journeyStage?:JourneyStage;onlineSessions?:number;challenges?:Challenge[];physicalMeeting?:PhysicalMeeting;sharedExperience?:SharedExperience;portalAccessStatus?:"invited"|"active"|"disabled";portalInvitedAt?:string};
const BUCKET="invitation-photos";
const photoPath=(id:string)=>id;

async function writeInvitation(record:Invitation){
 const {error}=await createSupabaseAdmin().from("invitations").upsert({id:record.id,record,created_at:record.createdAt,updated_at:new Date().toISOString()});
 if(error)throw error;
}

export async function saveInvitation(input:Omit<Invitation,"id"|"createdAt"|"status">,photo?:File){
 const id=crypto.randomUUID();
 const record:Invitation={...input,id,createdAt:new Date().toISOString(),status:"noua"};
 const db=createSupabaseAdmin();
 if(photo){const {error}=await db.storage.from(BUCKET).upload(photoPath(id),Buffer.from(await photo.arrayBuffer()),{contentType:photo.type,upsert:true});if(error)throw error}
 try{await writeInvitation(record)}
 catch(error){if(photo)await db.storage.from(BUCKET).remove([photoPath(id)]);throw error}
 return record;
}
export async function readInvitation(id:string){
 const {data,error}=await createSupabaseAdmin().from("invitations").select("record").eq("id",id).maybeSingle();
 if(error)throw error;
 return data?.record as Invitation|null;
}
export async function listInvitations(){
 const db=createSupabaseAdmin();
 const {data,error}=await db.from("invitations").select("record").order("created_at",{ascending:false}).limit(1000);
 if(error)throw error;
 const rows:Invitation[]=[];
  for(const record of (data||[]).map(row=>row.record as Invitation)){
   const expired=Date.now()-Date.parse(record.createdAt)>90*864e5;
   if(expired&&record.status!=="in_conversatie"&&record.portalAccessStatus!=="active"){
    try{await deleteInvitation(record.id)}catch(error){console.error("[invitations] RETENTION_CLEANUP_ERROR",error)}
   }else rows.push(record);
  }
 return rows.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
}
export async function updateInvitationStatus(id:string,status:InvitationStatus){
 const record=await readInvitation(id);
 if(!record)return null;
 const updated={...record,status};
 await writeInvitation(updated);
 return updated;
}
export async function updateJourney(id:string,input:{journeyStage?:JourneyStage;onlineSessions?:number;challenges?:Challenge[];physicalMeeting?:PhysicalMeeting;sharedExperience?:SharedExperience}){
 const record=await readInvitation(id);if(!record)return null;
 const updated={...record,...input};
 await writeInvitation(updated);
 return updated;
}
export async function updatePortalAccess(id:string,portalAccessStatus:Invitation["portalAccessStatus"]){
 const record=await readInvitation(id);if(!record)return null;
 const updated={...record,portalAccessStatus,portalInvitedAt:portalAccessStatus==="invited"?new Date().toISOString():record.portalInvitedAt};
 await writeInvitation(updated);
 return updated;
}
export async function updateBooking(id:string,bookingStatus:"pending"|"confirmed"|"declined",slotStart?:string,slotDuration?:number){
 const record=await readInvitation(id);if(!record)return null;
 const updated={...record,bookingStatus,slotStart:slotStart||record.slotStart,slotDuration:slotDuration||record.slotDuration,confirmationSentAt:bookingStatus==="confirmed"&&record.bookingStatus==="confirmed"&&(!slotStart||slotStart===record.slotStart)?record.confirmationSentAt:undefined};
 await writeInvitation(updated);
 return updated;
}
export async function markConfirmationSent(id:string){
 const record=await readInvitation(id);if(!record)return null;
 const updated={...record,confirmationSentAt:new Date().toISOString()};
 await writeInvitation(updated);return updated;
}
export async function deleteInvitation(id:string){
 const record=await readInvitation(id);
 if(!record)return false;
 const db=createSupabaseAdmin();
 if(record.photoType)await db.storage.from(BUCKET).remove([photoPath(id)]);
 const {error}=await db.from("invitations").delete().eq("id",id);if(error)throw error;
 await deleteConversation(id);
 return true;
}
export async function readInvitationPhoto(id:string){
 const {data,error}=await createSupabaseAdmin().storage.from(BUCKET).download(photoPath(id));
 if(error||!data)return null;
 return {statusCode:200,stream:data.stream()};
}
