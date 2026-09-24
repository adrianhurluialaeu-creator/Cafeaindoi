import {createHash} from "crypto";
import {createSupabaseAdmin} from "./supabase";

function hash(scope:string,key:string){const secret=process.env.RATE_LIMIT_SECRET||process.env.ADMIN_PASSWORD||"cafeaindoi";return createHash("sha256").update(`${secret}:${scope}:${key}`).digest("hex")}
export async function consumeRateLimit(scope:string,key:string,max:number,windowMs:number,options:{failClosed?:boolean}={}){try{const {data,error}=await createSupabaseAdmin().rpc("consume_rate_limit",{p_scope:scope,p_key_hash:hash(scope,key),p_max:max,p_window_ms:windowMs,p_now:Date.now()});if(error)throw error;return data?.[0]||{allowed:!options.failClosed,retryAfter:options.failClosed?60:0}}catch(error){console.error("[rate-limit] ERROR",error);return{allowed:!options.failClosed,retryAfter:options.failClosed?60:0}}}
export async function resetRateLimit(scope:string,key:string){const {error}=await createSupabaseAdmin().from("rate_limits").delete().eq("scope",scope).eq("key_hash",hash(scope,key));if(error)console.error("[rate-limit] RESET_ERROR",error)}
export function requestIp(req:Request){return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown"}
