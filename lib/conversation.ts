import { createSupabaseAdmin } from "./supabase";

export type ConversationMessage={id:string;sender:"adrian"|"ea";text:string;kind?:"text"|"sticker"|"question"|"declaration"|"challenge";reactions?:{sender:"adrian"|"ea";emoji:string}[];createdAt:string};
export type CoffeeMeeting={id:string;proposer:"adrian"|"ea";startsAt:string;plannedMinutes:number;status:"propusa"|"acceptata"|"refuzata"|"anulata";roomName?:string;createdAt:string};
export type Conversation={invitationId:string;messages:ConversationMessage[];meeting?:CoffeeMeeting;lastActivityAt?:string;expiresAt?:string};

const validId=(id:string)=>/^[0-9a-f-]{36}$/i.test(id);
const fail=(message:string):never=>{throw new Error(message)};

async function ensureConversation(invitationId:string){
 const db=createSupabaseAdmin();
 const {error}=await db.from("conversations").upsert({id:invitationId},{onConflict:"id",ignoreDuplicates:true});
 if(error)fail("Conversația nu a putut fi inițializată.");
 return db;
}

async function touchConversation(db:ReturnType<typeof createSupabaseAdmin>,invitationId:string,extendExpiry=false){
 const now=new Date(),values:{updated_at:string;last_activity_at?:string;expires_at?:string}={updated_at:now.toISOString()};
 if(extendExpiry){values.last_activity_at=now.toISOString();values.expires_at=new Date(now.getTime()+864e5).toISOString()}
 const {error}=await db.from("conversations").update(values).eq("id",invitationId);
 if(error)fail("Conversația nu a putut fi actualizată.");
}

export async function readConversation(invitationId:string):Promise<Conversation|null>{
 if(!validId(invitationId))return null;
 const db=await ensureConversation(invitationId);
 let {data:meta,error:metaError}=await db.from("conversations").select("last_activity_at,expires_at").eq("id",invitationId).single();
 if(metaError)fail("Conversația nu a putut fi citită.");
 if(meta?.expires_at&&Date.parse(meta.expires_at)<=Date.now()){
  await db.rpc("purge_expired_conversations");
  meta={last_activity_at:null,expires_at:null};
 }
 const [{data:rows,error:messagesError},{data:meeting,error:meetingError}]=await Promise.all([
  db.from("conversation_messages").select("id,sender,body,kind,created_at,conversation_reactions(sender,emoji)").eq("conversation_id",invitationId).order("created_at",{ascending:true}).limit(200),
  db.from("coffee_meetings").select("id,proposer,starts_at,planned_minutes,status,room_name,created_at").eq("conversation_id",invitationId).maybeSingle(),
 ]);
 if(messagesError||meetingError)fail("Conversația nu a putut fi citită.");
 const messages:ConversationMessage[]=(rows||[]).map((row:any)=>({id:row.id,sender:row.sender,text:row.body,kind:row.kind,reactions:(row.conversation_reactions||[]).map((item:any)=>({sender:item.sender,emoji:item.emoji})),createdAt:row.created_at}));
 return {invitationId,messages,meeting:meeting?{id:meeting.id,proposer:meeting.proposer,startsAt:meeting.starts_at,plannedMinutes:meeting.planned_minutes,status:meeting.status,roomName:meeting.room_name||undefined,createdAt:meeting.created_at}:undefined,lastActivityAt:meta?.last_activity_at||undefined,expiresAt:meta?.expires_at||undefined};
}

export async function sendConversationMessage(invitationId:string,sender:ConversationMessage["sender"],raw:string,kind:ConversationMessage["kind"]="text"){
 if(!validId(invitationId))fail("Conversația nu este validă.");
 const text=raw.trim().replace(/\r\n/g,"\n").slice(0,2000);
 if(!text)fail("Mesajul este gol.");
 if(!["text","sticker","question","declaration","challenge"].includes(kind||""))fail("Tipul mesajului nu este valid.");
 const db=await ensureConversation(invitationId);
 const {error}=await db.from("conversation_messages").insert({conversation_id:invitationId,sender,body:text,kind});
 if(error)fail("Mesajul nu a putut fi trimis.");
 await touchConversation(db,invitationId,true);
 return readConversation(invitationId);
}

export async function reactToConversationMessage(invitationId:string,messageId:string,sender:ConversationMessage["sender"],emoji:string){
 if(!validId(invitationId)||!validId(messageId))fail("Mesajul nu este valid.");
 if(!["❤️","😂","🥰","👍","😮","😔"].includes(emoji))fail("Reacția nu este validă.");
 const db=await ensureConversation(invitationId);
 const {data:message}=await db.from("conversation_messages").select("id").eq("id",messageId).eq("conversation_id",invitationId).maybeSingle();
 if(!message)fail("Mesajul nu mai există.");
 const {error}=await db.from("conversation_reactions").upsert({message_id:messageId,sender,emoji},{onConflict:"message_id,sender"});
 if(error)fail("Reacția nu a putut fi salvată.");
 await touchConversation(db,invitationId);
 return readConversation(invitationId);
}

export async function proposeCoffeeMeeting(invitationId:string,proposer:CoffeeMeeting["proposer"],startsAt:string,plannedMinutes:number){
 const timestamp=Date.parse(startsAt);
 if(!validId(invitationId))fail("Conversația nu este validă.");
 if(!Number.isFinite(timestamp)||timestamp<Date.now())fail("Alege o dată viitoare.");
 if(![15,30,60,90].includes(plannedMinutes))fail("Durata orientativă nu este validă.");
 const db=await ensureConversation(invitationId),row={id:crypto.randomUUID(),conversation_id:invitationId,proposer,starts_at:new Date(timestamp).toISOString(),planned_minutes:plannedMinutes,status:"propusa",room_name:null,updated_at:new Date().toISOString()};
 const {error}=await db.from("coffee_meetings").upsert(row,{onConflict:"conversation_id"});
 if(error)fail("Invitația la cafea nu a putut fi salvată.");
 await touchConversation(db,invitationId);
 return readConversation(invitationId);
}

export async function respondCoffeeMeeting(invitationId:string,status:CoffeeMeeting["status"]){
 if(!["acceptata","refuzata","anulata"].includes(status))fail("Răspunsul nu este valid.");
 const db=await ensureConversation(invitationId);
 const {data,error}=await db.from("coffee_meetings").update({status,updated_at:new Date().toISOString()}).eq("conversation_id",invitationId).select("id").maybeSingle();
 if(error||!data)fail("Invitația la cafea nu mai există.");
 await touchConversation(db,invitationId);
 return readConversation(invitationId);
}

export async function attachMeetingRoom(invitationId:string,roomName:string){
 const db=await ensureConversation(invitationId);
 const {data,error}=await db.from("coffee_meetings").update({room_name:roomName,updated_at:new Date().toISOString()}).eq("conversation_id",invitationId).select("id").maybeSingle();
 if(error||!data)fail("Invitația la cafea nu mai există.");
 await touchConversation(db,invitationId);
 return readConversation(invitationId);
}

export async function deleteConversation(invitationId:string){
 if(!validId(invitationId))return;
 const {error}=await createSupabaseAdmin().from("conversations").delete().eq("id",invitationId);
 if(error)fail("Conversația nu a putut fi ștearsă.");
}

export async function purgeExpiredConversations(){
 const {data,error}=await createSupabaseAdmin().rpc("purge_expired_conversations");
 if(error)fail("Conversațiile expirate nu au putut fi curățate.");
 return Number(data||0);
}
