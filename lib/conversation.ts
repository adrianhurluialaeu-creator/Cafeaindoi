import {del,get,list,put} from "@vercel/blob";

export type ConversationMessage={id:string;sender:"adrian"|"ea";text:string;kind?:"text"|"sticker"|"question"|"declaration"|"challenge";reactions?:{sender:"adrian"|"ea";emoji:string}[];createdAt:string};
export type CoffeeMeeting={id:string;proposer:"adrian"|"ea";startsAt:string;plannedMinutes:number;status:"propusa"|"acceptata"|"refuzata"|"anulata";roomName?:string;createdAt:string};
export type Conversation={invitationId:string;messages:ConversationMessage[];meeting?:CoffeeMeeting;lastActivityAt?:string;expiresAt?:string};

const DAY=24*60*60*1000;
const statePath=(id:string)=>`portal-conversations/${id}.json`;
const messagePrefix=(id:string)=>`portal-conversation-messages/${id}/`;
const reactionPrefix=(id:string)=>`portal-conversation-reactions/${id}/`;
const validId=(id:string)=>/^[0-9a-f-]{36}$/i.test(id);

async function jsonAt<T>(path:string){
 const result=await get(path,{access:"private",useCache:false});
 if(!result||result.statusCode!==200)return null;
 try{return JSON.parse(await new Response(result.stream).text()) as T}catch{return null}
}
async function state(invitationId:string){return await jsonAt<Conversation>(statePath(invitationId))||{invitationId,messages:[]}}
async function writeState(row:Conversation){
 const compact:Conversation={invitationId:row.invitationId,messages:row.messages,meeting:row.meeting,lastActivityAt:row.lastActivityAt,expiresAt:row.expiresAt};
 await put(statePath(row.invitationId),JSON.stringify(compact),{access:"private",addRandomSuffix:false,allowOverwrite:true,contentType:"application/json"});
 return compact;
}
async function listedJson<T>(prefix:string){
 const {blobs}=await list({prefix,limit:1000});
 const rows=await Promise.all(blobs.map(blob=>jsonAt<T>(blob.pathname)));
 return rows.filter(item=>item!==null) as T[];
}
async function deleteListed(prefix:string){const {blobs}=await list({prefix,limit:1000});if(blobs.length)await del(blobs.map(blob=>blob.url))}
async function pruneMessages(invitationId:string){const {blobs}=await list({prefix:messagePrefix(invitationId),limit:1000});const obsolete=blobs.sort((a,b)=>new Date(b.uploadedAt).getTime()-new Date(a.uploadedAt).getTime()).slice(200);if(obsolete.length)await del(obsolete.map(blob=>blob.url))}
async function assembled(invitationId:string){
 const base=await state(invitationId);
 const stored=await listedJson<ConversationMessage>(messagePrefix(invitationId));
 const messages=[...base.messages,...stored].filter((message,index,all)=>all.findIndex(item=>item.id===message.id)===index).sort((a,b)=>Date.parse(a.createdAt)-Date.parse(b.createdAt)).slice(-200);
 const reactions=await listedJson<{messageId:string;sender:"adrian"|"ea";emoji:string}>(reactionPrefix(invitationId));
 for(const message of messages)message.reactions=reactions.filter(item=>item.messageId===message.id).map(({sender,emoji})=>({sender,emoji}));
 const latest=messages.at(-1)?.createdAt;
 return {...base,messages,lastActivityAt:latest,expiresAt:latest?new Date(Date.parse(latest)+DAY).toISOString():undefined};
}

export async function readConversation(invitationId:string):Promise<Conversation|null>{
 if(!validId(invitationId))return null;
 const row=await assembled(invitationId);
 if(row.expiresAt&&Date.parse(row.expiresAt)<=Date.now()){
  await Promise.all([deleteListed(messagePrefix(invitationId)),deleteListed(reactionPrefix(invitationId))]);
  await writeState({invitationId,messages:[],meeting:row.meeting});
  return {invitationId,messages:[],meeting:row.meeting,lastActivityAt:undefined,expiresAt:undefined};
 }
 return row;
}
export async function sendConversationMessage(invitationId:string,sender:ConversationMessage["sender"],raw:string,kind:ConversationMessage["kind"]="text"){
 if(!validId(invitationId))throw new Error("Conversația nu este validă.");
 const text=raw.trim().replace(/\r\n/g,"\n").slice(0,2000);
 if(!text)throw new Error("Mesajul este gol.");
 if(!["text","sticker","question","declaration","challenge"].includes(kind||""))throw new Error("Tipul mesajului nu este valid.");
 const message:ConversationMessage={id:crypto.randomUUID(),sender,text,kind,createdAt:new Date().toISOString()};
 await put(`${messagePrefix(invitationId)}${message.id}.json`,JSON.stringify(message),{access:"private",addRandomSuffix:false,allowOverwrite:false,contentType:"application/json"});
 await pruneMessages(invitationId);
 return readConversation(invitationId);
}
export async function reactToConversationMessage(invitationId:string,messageId:string,sender:ConversationMessage["sender"],emoji:string){
 if(!validId(messageId))throw new Error("Mesajul nu este valid.");
 if(!["❤️","😂","🥰","👍","😮","😔"].includes(emoji))throw new Error("Reacția nu este validă.");
 const current=await readConversation(invitationId);if(!current?.messages.some(message=>message.id===messageId))throw new Error("Mesajul nu mai există.");
 await put(`${reactionPrefix(invitationId)}${messageId}-${sender}.json`,JSON.stringify({messageId,sender,emoji}),{access:"private",addRandomSuffix:false,allowOverwrite:true,contentType:"application/json"});
 return readConversation(invitationId);
}
export async function proposeCoffeeMeeting(invitationId:string,proposer:CoffeeMeeting["proposer"],startsAt:string,plannedMinutes:number){
 const timestamp=Date.parse(startsAt);if(!Number.isFinite(timestamp)||timestamp<Date.now())throw new Error("Alege o dată viitoare.");
 if(![15,30,60,90].includes(plannedMinutes))throw new Error("Durata orientativă nu este validă.");
 const current=await state(invitationId),meeting:CoffeeMeeting={id:crypto.randomUUID(),proposer,startsAt:new Date(timestamp).toISOString(),plannedMinutes,status:"propusa",createdAt:new Date().toISOString()};
 await writeState({...current,meeting});return readConversation(invitationId);
}
export async function respondCoffeeMeeting(invitationId:string,status:CoffeeMeeting["status"]){
 if(!["acceptata","refuzata","anulata"].includes(status))throw new Error("Răspunsul nu este valid.");
 const current=await state(invitationId);if(!current.meeting)throw new Error("Invitația la cafea nu mai există.");
 await writeState({...current,meeting:{...current.meeting,status}});return readConversation(invitationId);
}
export async function attachMeetingRoom(invitationId:string,roomName:string){
 const current=await state(invitationId);if(!current.meeting)throw new Error("Invitația la cafea nu mai există.");
 await writeState({...current,meeting:{...current.meeting,roomName}});return readConversation(invitationId);
}
export async function deleteConversation(invitationId:string){await Promise.all([del(statePath(invitationId)),deleteListed(messagePrefix(invitationId)),deleteListed(reactionPrefix(invitationId))])}
export async function purgeExpiredConversations(){
 const [states,messages]=await Promise.all([list({prefix:"portal-conversations/",limit:1000}),list({prefix:"portal-conversation-messages/",limit:1000})]);
 const ids=new Set<string>();for(const blob of [...states.blobs,...messages.blobs]){const match=blob.pathname.match(/^portal-conversation(?:s|-messages)\/([0-9a-f-]{36})/i);if(match)ids.add(match[1])}
 let purged=0;for(const id of ids){const row=await assembled(id);if(row.expiresAt&&Date.parse(row.expiresAt)<=Date.now()){await deleteConversation(id);if(row.meeting)await writeState({invitationId:id,messages:[],meeting:row.meeting});purged+=1}}
 return purged;
}
