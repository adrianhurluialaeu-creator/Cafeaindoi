import {createHash} from "crypto";
import {del,get,list,put} from "@vercel/blob";
import webpush from "web-push";

export type StoredSubscription={endpoint:string;keys:{p256dh:string;auth:string};createdAt:string};
const PREFIX="admin-push/";
const KEY_PATH="settings/admin-push-vapid.json";
type Keys={publicKey:string;privateKey:string};
export async function getPushKeys():Promise<Keys>{
 const stored=await get(KEY_PATH,{access:"private",useCache:false});
 if(stored&&stored.statusCode===200)return JSON.parse(await new Response(stored.stream).text()) as Keys;
 const keys=webpush.generateVAPIDKeys();
 try{await put(KEY_PATH,JSON.stringify(keys),{access:"private",addRandomSuffix:false,contentType:"application/json"});return keys}
 catch(error){const concurrent=await get(KEY_PATH,{access:"private",useCache:false});if(concurrent&&concurrent.statusCode===200)return JSON.parse(await new Response(concurrent.stream).text()) as Keys;throw error}
}

const pathFor=(endpoint:string)=>PREFIX+createHash("sha256").update(endpoint).digest("hex")+".json";
const allowedHost=(host:string)=>host==="fcm.googleapis.com"||host==="updates.push.services.mozilla.com"||host==="web.push.apple.com"||host.endsWith(".push.apple.com")||host.endsWith(".push.services.mozilla.com")||host.endsWith(".googleapis.com");
export function validateSubscription(value:any):value is StoredSubscription{
 try{const url=new URL(value?.endpoint);return url.protocol==="https:"&&allowedHost(url.hostname)&&url.username===""&&url.password===""&&url.port===""&&typeof value?.keys?.p256dh==="string"&&/^[A-Za-z0-9_-]{60,150}$/.test(value.keys.p256dh)&&typeof value?.keys?.auth==="string"&&/^[A-Za-z0-9_-]{12,50}$/.test(value.keys.auth)}catch{return false}
}
export async function saveSubscription(value:StoredSubscription){await put(pathFor(value.endpoint),JSON.stringify(value),{access:"private",addRandomSuffix:false,allowOverwrite:true,contentType:"application/json"})}
export async function deleteSubscription(endpoint:string){await del(pathFor(endpoint))}
export async function listSubscriptions(){const rows:StoredSubscription[]=[];let cursor:string|undefined;do{const page=await list({prefix:PREFIX,limit:1000,cursor});for(const b of page.blobs){const r=await get(b.pathname,{access:"private",useCache:false});if(r&&r.statusCode===200)rows.push(JSON.parse(await new Response(r.stream).text()))}cursor=page.hasMore?page.cursor:undefined}while(cursor);return rows}
export async function sendPush(title:string,body:string){
 const keys=await getPushKeys();
 webpush.setVapidDetails("mailto:contact@cafeaindoi.eu",keys.publicKey,keys.privateKey);
 const subscriptions=await listSubscriptions();let sent=0;
 await Promise.all(subscriptions.map(async sub=>{try{await webpush.sendNotification({endpoint:sub.endpoint,keys:sub.keys},JSON.stringify({title,body,url:"/admin/invitatii"}),{TTL:3600});sent++}catch(error){const status=(error as {statusCode?:number}).statusCode;if(status===404||status===410)await deleteSubscription(sub.endpoint);else console.error("[push] SEND_ERROR",status||error)}}));
 return {sent};
}
