import {createSupabaseAdmin} from "./supabase";

export const INVITATION_MEDIA_BUCKET="invitation-photos";
export const MAX_INVITATION_MEDIA_BYTES=4*1024*1024;
export const INVITATION_MEDIA_TYPES=new Set(["image/jpeg","video/webm","video/mp4"]);
const PENDING=/^pending\/[0-9a-f-]{36}$/i;

export function validPendingMediaPath(value:string){return PENDING.test(value)}

export async function createPendingMediaUpload(contentType:string){
 if(!INVITATION_MEDIA_TYPES.has(contentType))throw new Error("Format neacceptat.");
 const path=`pending/${crypto.randomUUID()}`;
 const {data,error}=await createSupabaseAdmin().storage.from(INVITATION_MEDIA_BUCKET).createSignedUploadUrl(path);
 if(error||!data?.token)throw error||new Error("URL-ul de încărcare nu a putut fi creat.");
 return {path,token:data.token};
}

export async function validatePendingMedia(path:string,contentType:string){
 if(!validPendingMediaPath(path)||!INVITATION_MEDIA_TYPES.has(contentType))return false;
 const {data,error}=await createSupabaseAdmin().storage.from(INVITATION_MEDIA_BUCKET).download(path);
 if(error||!data||data.size<4||data.size>MAX_INVITATION_MEDIA_BYTES)return false;
 const signature=Buffer.from(await data.slice(0,16).arrayBuffer());
 const jpeg=contentType==="image/jpeg"&&signature[0]===0xff&&signature[1]===0xd8&&signature[2]===0xff;
 const webm=contentType==="video/webm"&&signature[0]===0x1a&&signature[1]===0x45&&signature[2]===0xdf&&signature[3]===0xa3;
 const mp4=contentType==="video/mp4"&&signature.subarray(4,12).toString("ascii").includes("ftyp");
 return jpeg||webm||mp4;
}

export async function deletePendingMedia(path:string){
 if(!validPendingMediaPath(path))return;
 const {error}=await createSupabaseAdmin().storage.from(INVITATION_MEDIA_BUCKET).remove([path]);
 if(error)console.error("[invitation-media] DELETE_PENDING_ERROR",error);
}

export async function cleanupPendingMedia(maxAgeMs=3*60*60*1000){
 const storage=createSupabaseAdmin().storage.from(INVITATION_MEDIA_BUCKET),cutoff=Date.now()-maxAgeMs;
 let offset=0;const stale:string[]=[];
 while(offset<1000){
  const {data,error}=await storage.list("pending",{limit:100,offset,sortBy:{column:"created_at",order:"asc"}});
  if(error)throw error;
  for(const file of data||[])if(file.id&&file.created_at&&Date.parse(file.created_at)<cutoff)stale.push(`pending/${file.name}`);
  if(!data||data.length<100)break;offset+=100;
 }
 for(let i=0;i<stale.length;i+=100){const {error}=await storage.remove(stale.slice(i,i+100));if(error)throw error}
 return stale.length;
}
