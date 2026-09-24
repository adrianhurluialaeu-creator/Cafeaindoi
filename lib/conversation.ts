import {del,get,put} from "@vercel/blob";

export type ConversationMessage={
 id:string;
 sender:"adrian"|"ea";
 text:string;
 kind?:"text"|"sticker"|"question"|"declaration"|"challenge";
 reactions?:{sender:"adrian"|"ea";emoji:string}[];
 createdAt:string;
};

export type CoffeeMeeting={
 id:string;
 proposer:"adrian"|"ea";
 startsAt:string;
 plannedMinutes:number;
 status:"propusa"|"acceptata"|"refuzata"|"anulata";
 roomName?:string;
 createdAt:string;
};

export type Conversation={
 invitationId:string;
 messages:ConversationMessage[];
 meeting?:CoffeeMeeting;
 lastActivityAt?:string;
 expiresAt?:string;
};

const DAY=24*60*60*1000;
const pathFor=(id:string)=>`portal-conversations/${id}.json`;
const validId=(id:string)=>/^[0-9a-f-]{36}$/i.test(id);

async function write(row:Conversation){
 await put(pathFor(row.invitationId),JSON.stringify(row),{access:"private",addRandomSuffix:false,allowOverwrite:true,contentType:"application/json"});
 return row;
}

export async function readConversation(invitationId:string){
 if(!validId(invitationId))return null;
 const result=await get(pathFor(invitationId),{access:"private",useCache:false});
 if(!result||result.statusCode!==200)return {invitationId,messages:[]} satisfies Conversation;
 const row=JSON.parse(await new Response(result.stream).text()) as Conversation;
 if(row.expiresAt&&Date.parse(row.expiresAt)<=Date.now()){
  const clean:Conversation={invitationId,messages:[],meeting:row.meeting};
  await write(clean);
  return clean;
 }
 return row;
}

export async function sendConversationMessage(invitationId:string,sender:ConversationMessage["sender"],raw:string,kind:ConversationMessage["kind"]="text"){
 const text=raw.trim().replace(/\r\n/g,"\n").slice(0,2000);
 if(!text)throw new Error("Mesajul este gol.");
 if(!["text","sticker","question","declaration","challenge"].includes(kind||""))throw new Error("Tipul mesajului nu este valid.");
 const current=await readConversation(invitationId)||{invitationId,messages:[]};
 const now=new Date();
 const message:ConversationMessage={id:crypto.randomUUID(),sender,text,kind,createdAt:now.toISOString()};
 return write({...current,messages:[...current.messages.slice(-199),message],lastActivityAt:now.toISOString(),expiresAt:new Date(now.getTime()+DAY).toISOString()});
}

export async function reactToConversationMessage(invitationId:string,messageId:string,sender:ConversationMessage["sender"],emoji:string){
 if(!["❤️","😂","🥰","👍","😮","😔"].includes(emoji))throw new Error("Reacția nu este validă.");
 const current=await readConversation(invitationId);if(!current)throw new Error("Conversația nu există.");
 const messages=current.messages.map(message=>message.id!==messageId?message:{...message,reactions:[...(message.reactions||[]).filter(item=>item.sender!==sender),{sender,emoji}]});
 return write({...current,messages});
}

export async function proposeCoffeeMeeting(invitationId:string,proposer:CoffeeMeeting["proposer"],startsAt:string,plannedMinutes:number){
 const timestamp=Date.parse(startsAt);
 if(!Number.isFinite(timestamp)||timestamp<Date.now()-5*60_000)throw new Error("Alege o dată viitoare.");
 if(![15,30,60,90].includes(plannedMinutes))throw new Error("Durata orientativă nu este validă.");
 const current=await readConversation(invitationId)||{invitationId,messages:[]};
 const meeting:CoffeeMeeting={id:crypto.randomUUID(),proposer,startsAt:new Date(timestamp).toISOString(),plannedMinutes,status:"propusa",createdAt:new Date().toISOString()};
 return write({...current,meeting});
}

export async function respondCoffeeMeeting(invitationId:string,status:"acceptata"|"refuzata"|"anulata"){
 const current=await readConversation(invitationId);
 if(!current?.meeting)throw new Error("Invitația la cafea nu mai există.");
 return write({...current,meeting:{...current.meeting,status}});
}

export async function attachMeetingRoom(invitationId:string,roomName:string){
 const current=await readConversation(invitationId);
 if(!current?.meeting)throw new Error("Invitația la cafea nu mai există.");
 return write({...current,meeting:{...current.meeting,roomName}});
}

export async function deleteConversation(invitationId:string){
 await del(pathFor(invitationId));
}
