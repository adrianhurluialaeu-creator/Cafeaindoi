import {createHash} from "crypto";
import {NextResponse} from "next/server";
import {createSupabaseAdmin} from "../../../lib/supabase";
import {consumeRateLimit,requestIp} from "../../../lib/rate-limit";

export const runtime="nodejs";
const events=new Set(["page_view","compatibility_started","compatibility_step_completed","compatibility_completed","invitation_started","invitation_step_completed","invitation_media_ready","invitation_submitted","video_call_started","audio_call_started"]);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const clean=(value:unknown,max=160)=>typeof value==="string"?value.trim().slice(0,max)||null:null;
const safePath=(value:unknown)=>{const path=clean(value,300)||"/";return path.startsWith("/")?path:"/"};
function metadata(value:unknown){
 if(!value||typeof value!=="object"||Array.isArray(value))return {};
 const result:Record<string,string|number|boolean>={};
 for(const [key,item] of Object.entries(value).slice(0,8))if(/^[a-zA-Z0-9_]{1,40}$/.test(key)&&(typeof item==="string"||typeof item==="number"||typeof item==="boolean"))result[key]=typeof item==="string"?item.slice(0,100):item;
 return result;
}
export async function POST(req:Request){
 try{
  const limit=await consumeRateLimit("analytics",requestIp(req),120,60_000);if(!limit.allowed)return new NextResponse(null,{status:204});
  const body=await req.json();
  if(!uuid.test(body.sessionId)||!uuid.test(body.visitorId)||!events.has(body.event))return NextResponse.json({error:"Date invalide."},{status:400});
  const source=body.attribution&&typeof body.attribution==="object"?body.attribution:{};
  let referrerHost:string|null=null;try{const ref=clean(body.referrer,500);if(ref)referrerHost=new URL(ref).hostname.slice(0,160)}catch{}
  const hashSecret=process.env.ANALYTICS_HASH_SECRET||process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_PASSWORD;
  if(!hashSecret)throw new Error("ANALYTICS_HASH_SECRET is not configured");
  const now=new Date().toISOString(),db=createSupabaseAdmin(),visitorHash=createHash("sha256").update(`${hashSecret}:${body.visitorId}`).digest("hex");
  const {error:sessionError}=await db.from("analytics_sessions").upsert({id:body.sessionId,visitor_hash:visitorHash,started_at:now,last_seen_at:now,landing_path:safePath(body.path),referrer_host:referrerHost,utm_source:clean(source.source),utm_medium:clean(source.medium),utm_campaign:clean(source.campaign),utm_content:clean(source.content),utm_term:clean(source.term),gclid:clean(source.gclid,200),device_type:["mobile","tablet","desktop"].includes(body.device)?body.device:"desktop"},{onConflict:"id",ignoreDuplicates:true});
  if(sessionError)throw sessionError;
  await db.from("analytics_sessions").update({last_seen_at:now}).eq("id",body.sessionId);
  const {error}=await db.from("analytics_events").insert({session_id:body.sessionId,event_name:body.event,path:safePath(body.path),metadata:metadata(body.metadata),created_at:now});if(error)throw error;
  return new NextResponse(null,{status:204});
 }catch(error){console.error("[analytics] WRITE_ERROR",error);return new NextResponse(null,{status:204})}
}
