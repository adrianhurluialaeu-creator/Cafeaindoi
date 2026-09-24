import {createSupabaseAdmin} from "./supabase";
import {randomUUID} from "crypto";
import {ContactSettings,ContactStatus,defaultContactSettings,validateContactSettings} from "./contact-schema";
export {defaultContactSettings,validateContactInput,validateContactSettings} from "./contact-schema";
export type {ContactSettings,ContactStatus} from "./contact-schema";

export type ContactMessage={id:string;name:string;email:string;subject:string;message:string;status:ContactStatus;internalNote:string;consentedAt:string;createdAt:string;updatedAt:string};
export const CONTACT_SETTINGS_KEY="contact_settings_v1";
export async function getContactSettings(){const {data,error}=await createSupabaseAdmin().from("app_settings").select("value").eq("key",CONTACT_SETTINGS_KEY).maybeSingle();if(error)throw error;return validateContactSettings(data?.value)||defaultContactSettings}
export async function saveContactSettings(settings:ContactSettings){const {error}=await createSupabaseAdmin().from("app_settings").upsert({key:CONTACT_SETTINGS_KEY,value:settings,updated_at:new Date().toISOString()});if(error)throw error;return settings}
const map=(row:any):ContactMessage=>({id:row.id,name:row.record.name,email:row.record.email,subject:row.record.subject,message:row.record.message,status:row.status,internalNote:row.record.internalNote||"",consentedAt:row.record.consentedAt,createdAt:row.created_at,updatedAt:row.updated_at});
export async function createContactMessage(input:{name:string;email:string;subject:string;message:string}){const now=new Date().toISOString(),id=randomUUID(),record={...input,internalNote:"",consentedAt:now},{data,error}=await createSupabaseAdmin().from("content_records").insert({kind:"contact_message",id,status:"new",record,created_at:now,updated_at:now}).select("*").single();if(error)throw error;return map(data)}
export async function listContactMessages(){const {data,error}=await createSupabaseAdmin().from("content_records").select("*").eq("kind","contact_message").order("created_at",{ascending:false}).limit(1000);if(error)throw error;return(data||[]).map(map)}
export async function updateContactMessage(id:string,input:{status:ContactStatus;internalNote:string}){const db=createSupabaseAdmin(),{data:existing,error:readError}=await db.from("content_records").select("record").eq("kind","contact_message").eq("id",id).single();if(readError)throw readError;const {data,error}=await db.from("content_records").update({status:input.status,record:{...existing.record,internalNote:input.internalNote},updated_at:new Date().toISOString()}).eq("kind","contact_message").eq("id",id).select("*").single();if(error)throw error;return map(data)}
