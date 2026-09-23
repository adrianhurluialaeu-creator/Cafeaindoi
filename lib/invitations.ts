import {del,get,list,put} from "@vercel/blob";

export type InvitationStatus="noua"|"in_conversatie"|"inchisa";
export type Invitation={id:string;prenume:string;varsta:number;localitate:string;tara:string;whatsapp:string;despre:string;createdAt:string;status:InvitationStatus;photoType:string;slotStart?:string;slotDuration?:number;bookingStatus?:"pending"|"confirmed"|"declined"};
const recordPath=(id:string)=>`invitations/${id}.json`;
const photoPath=(id:string)=>`invitation-photos/${id}`;

export async function saveInvitation(input:Omit<Invitation,"id"|"createdAt"|"status">,photo:File){
 const id=crypto.randomUUID();
 const record:Invitation={...input,id,createdAt:new Date().toISOString(),status:"noua"};
 await put(photoPath(id),Buffer.from(await photo.arrayBuffer()),{access:"private",addRandomSuffix:false,contentType:photo.type});
 try{await put(recordPath(id),JSON.stringify(record),{access:"private",addRandomSuffix:false,contentType:"application/json"})}
 catch(error){await del(photoPath(id));throw error}
 return record;
}
export async function readInvitation(id:string){
 const result=await get(recordPath(id),{access:"private",useCache:false});
 if(!result||result.statusCode!==200)return null;
 return JSON.parse(await new Response(result.stream).text()) as Invitation;
}
export async function listInvitations(){
 const rows:Invitation[]=[];
 let cursor:string|undefined;
 do{
  const page=await list({prefix:"invitations/",limit:1000,cursor});
  const records=await Promise.all(page.blobs.map(b=>readInvitation(b.pathname.split("/").pop()!.replace(/\.json$/,""))));
  rows.push(...records.filter((r):r is Invitation=>r!==null));
  cursor=page.hasMore?page.cursor:undefined;
 }while(cursor);
 return rows.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
}
export async function updateInvitationStatus(id:string,status:InvitationStatus){
 const record=await readInvitation(id);
 if(!record)return null;
 const updated={...record,status};
 await put(recordPath(id),JSON.stringify(updated),{access:"private",addRandomSuffix:false,allowOverwrite:true,contentType:"application/json"});
 return updated;
}
export async function updateBooking(id:string,bookingStatus:"pending"|"confirmed"|"declined",slotStart?:string,slotDuration?:number){
 const record=await readInvitation(id);if(!record)return null;
 const updated={...record,bookingStatus,slotStart:slotStart||record.slotStart,slotDuration:slotDuration||record.slotDuration};
 await put(recordPath(id),JSON.stringify(updated),{access:"private",addRandomSuffix:false,allowOverwrite:true,contentType:"application/json"});
 return updated;
}
export async function deleteInvitation(id:string){
 const record=await readInvitation(id);
 if(!record)return false;
 await del([recordPath(id),photoPath(id)]);
 return true;
}
export async function readInvitationPhoto(id:string){return get(photoPath(id),{access:"private",useCache:false})}
