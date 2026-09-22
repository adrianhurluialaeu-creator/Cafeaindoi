import {del,get,list,put} from "@vercel/blob";

export type OpinionStatus="pending"|"approved";
export type OpinionRecord={
 id:string;
 article:string;
 articleTitle:string;
 prenume:string;
 opinia:string;
 createdAt:string;
 status:OpinionStatus;
 approvedAt?:string;
};

const PREFIX="opinions";

function pathFor(status:OpinionStatus,id:string){
 return `${PREFIX}/${status}/${id}.json`;
}

export async function savePendingOpinion(input:Omit<OpinionRecord,"id"|"createdAt"|"status">){
 const record:OpinionRecord={
  ...input,
  id:crypto.randomUUID(),
  createdAt:new Date().toISOString(),
  status:"pending"
 };
 await put(pathFor("pending",record.id),JSON.stringify(record),{
  access:"private",
  addRandomSuffix:false,
  contentType:"application/json"
 });
 return record;
}

async function readBlob(pathname:string){
 const result=await get(pathname,{access:"private",useCache:false});
 if(!result||result.statusCode!==200)return null;
 const raw=await new Response(result.stream).text();
 return JSON.parse(raw) as OpinionRecord;
}

export async function listOpinions(status:OpinionStatus){
 const {blobs}=await list({prefix:`${PREFIX}/${status}/`,limit:1000});
 const rows=(await Promise.all(blobs.map(b=>readBlob(b.pathname)))).filter(Boolean) as OpinionRecord[];
 return rows.sort((a,b)=>new Date(b.approvedAt||b.createdAt).getTime()-new Date(a.approvedAt||a.createdAt).getTime());
}

export async function listApprovedForArticle(article:string){
 const rows=await listOpinions("approved");
 return rows.filter(x=>x.article===article);
}

export async function approveOpinion(id:string){
 const pendingPath=pathFor("pending",id);
 const record=await readBlob(pendingPath);
 if(!record)throw new Error("Opinia nu a fost găsită.");
 const approved:OpinionRecord={...record,status:"approved",approvedAt:new Date().toISOString()};
 await put(pathFor("approved",id),JSON.stringify(approved),{
  access:"private",
  addRandomSuffix:false,
  contentType:"application/json"
 });
 await del(pendingPath);
 return approved;
}

export async function rejectOpinion(id:string){
 await del(pathFor("pending",id));
}

export async function deleteApprovedOpinion(id:string){
 await del(pathFor("approved",id));
}

export async function unpublishOpinion(id:string){
 const approvedPath=pathFor("approved",id);
 const record=await readBlob(approvedPath);
 if(!record)throw new Error("Opinia nu a fost găsită.");
 const pending:OpinionRecord={...record,status:"pending"};
 delete pending.approvedAt;
 await put(pathFor("pending",id),JSON.stringify(pending),{
  access:"private",
  addRandomSuffix:false,
  contentType:"application/json"
 });
 await del(approvedPath);
 return pending;
}
