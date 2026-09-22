import {del,get,list,put} from "@vercel/blob";

export type DeclarationStatus="draft"|"published";
export type DeclarationRecord={
 id:string;
 slug:string;
 title:string;
 text:string;
 category:string;
 imageUrl?:string;
 createdAt:string;
 updatedAt:string;
 publishedAt?:string;
 status:DeclarationStatus;
};

const PREFIX="declarations";

const read=async(pathname:string)=>{
 const r=await get(pathname,{access:"private",useCache:false});
 if(!r||r.statusCode!==200)return null;
 return JSON.parse(await new Response(r.stream).text()) as DeclarationRecord;
};

const pathFor=(status:DeclarationStatus,id:string)=>`${PREFIX}/${status}/${id}.json`;

export function declarationSlug(title:string){
 const base=title.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,90);
 return base||"declaratie";
}

export async function listDeclarations(status:DeclarationStatus){
 const {blobs}=await list({prefix:`${PREFIX}/${status}/`,limit:1000});
 const rows=(await Promise.all(blobs.map(b=>read(b.pathname)))).filter(Boolean) as DeclarationRecord[];
 return rows.sort((a,b)=>new Date(b.publishedAt||b.updatedAt).getTime()-new Date(a.publishedAt||a.updatedAt).getTime());
}

export async function getPublishedDeclarationBySlug(slug:string){
 const rows=await listDeclarations("published");
 return rows.find(x=>x.slug===slug)||null;
}

export async function createDeclaration(input:{title:string;text:string;category:string;imageUrl?:string;status?:DeclarationStatus}){
 const now=new Date().toISOString();
 const existing=[...(await listDeclarations("draft")),...(await listDeclarations("published"))];
 const root=declarationSlug(input.title);
 let slug=root,n=2;
 while(existing.some(x=>x.slug===slug)){slug=`${root}-${n++}`}
 const status=input.status||"draft";
 const rec:DeclarationRecord={id:crypto.randomUUID(),slug,title:input.title,text:input.text,category:input.category,imageUrl:input.imageUrl||undefined,createdAt:now,updatedAt:now,status};
 if(status==="published")rec.publishedAt=now;
 await put(pathFor(status,rec.id),JSON.stringify(rec),{access:"private",addRandomSuffix:false,contentType:"application/json"});
 return rec;
}

async function findAny(id:string){
 for(const status of ["draft","published"] as const){
  const pathname=pathFor(status,id);
  const rec=await read(pathname);
  if(rec)return {rec,pathname};
 }
 return null;
}

export async function updateDeclaration(id:string,input:Partial<Pick<DeclarationRecord,"title"|"text"|"category"|"imageUrl">>){
 const found=await findAny(id);
 if(!found)throw new Error("Declarația nu a fost găsită.");
 const rec={...found.rec,...input,updatedAt:new Date().toISOString()};
 await put(found.pathname,JSON.stringify(rec),{access:"private",addRandomSuffix:false,contentType:"application/json"});
 return rec;
}

export async function publishDeclaration(id:string){
 const found=await findAny(id);
 if(!found)throw new Error("Declarația nu a fost găsită.");
 const rec:DeclarationRecord={...found.rec,status:"published",updatedAt:new Date().toISOString(),publishedAt:found.rec.publishedAt||new Date().toISOString()};
 await put(pathFor("published",id),JSON.stringify(rec),{access:"private",addRandomSuffix:false,contentType:"application/json"});
 if(found.pathname!==pathFor("published",id))await del(found.pathname);
 return rec;
}

export async function unpublishDeclaration(id:string){
 const found=await findAny(id);
 if(!found)throw new Error("Declarația nu a fost găsită.");
 const rec:DeclarationRecord={...found.rec,status:"draft",updatedAt:new Date().toISOString()};
 delete rec.publishedAt;
 await put(pathFor("draft",id),JSON.stringify(rec),{access:"private",addRandomSuffix:false,contentType:"application/json"});
 if(found.pathname!==pathFor("draft",id))await del(found.pathname);
 return rec;
}

export async function deleteDeclaration(id:string){
 const found=await findAny(id);
 if(found)await del(found.pathname);
}

const likePrefix=(slug:string)=>`declaration-likes/${slug}/`;
const likePath=(slug:string,visitorId:string)=>`${likePrefix(slug)}${visitorId}.txt`;

export async function countDeclarationLikes(slug:string){
 const {blobs}=await list({prefix:likePrefix(slug),limit:1000});
 return blobs.length;
}

export async function setDeclarationLike(slug:string,visitorId:string,liked:boolean){
 const pathname=likePath(slug,visitorId);
 if(liked){
  await put(pathname,"1",{access:"private",addRandomSuffix:false,contentType:"text/plain"});
 }else{
  try{await del(pathname)}catch{}
 }
 return countDeclarationLikes(slug);
}
