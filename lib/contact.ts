import {createSupabaseAdmin} from "./supabase";
import {ContactSettings,ContactStatus,defaultContactSettings,validateContactSettings} from "./contact-schema";
export {defaultContactSettings,validateContactInput,validateContactSettings} from "./contact-schema";
export type {ContactSettings,ContactStatus} from "./contact-schema";

export type ContactMessage={id:string;name:string;email:string;subject:string;message:string;status:ContactStatus;internalNote:string;consentedAt:string;createdAt:string;updatedAt:string};
export const CONTACT_SETTINGS_KEY="contact_settings_v1";
export async function getContactSettings(){const {data,error}=await createSupabaseAdmin().from("app_settings").select("value").eq("key",CONTACT_SETTINGS_KEY).maybeSingle();if(error)throw error;return validateContactSettings(data?.value)||defaultContactSettings}
export async function saveContactSettings(settings:ContactSettings){const {error}=await createSupabaseAdmin().from("app_settings").upsert({key:CONTACT_SETTINGS_KEY,value:settings,updated_at:new Date().toISOString()});if(error)throw error;return settings}
const map=(row:any):ContactMessage=>({id:row.id,name:row.name,email:row.email,subject:row.subject,message:row.message,status:row.status,internalNote:row.internal_note||"",consentedAt:row.consented_at,createdAt:row.created_at,updatedAt:row.updated_at});
export async function createContactMessage(input:{name:string;email:string;subject:string;message:string}){const now=new Date().toISOString(),{data,error}=await createSupabaseAdmin().from("contact_messages").insert({name:input.name,email:input.email,subject:input.subject,message:input.message,consented_at:now}).select("*").single();if(error)throw error;return map(data)}
export async function listContactMessages(){const {data,error}=await createSupabaseAdmin().from("contact_messages").select("*").order("created_at",{ascending:false}).limit(1000);if(error)throw error;return(data||[]).map(map)}
export async function updateContactMessage(id:string,input:{status:ContactStatus;internalNote:string}){const {data,error}=await createSupabaseAdmin().from("contact_messages").update({status:input.status,internal_note:input.internalNote,updated_at:new Date().toISOString()}).eq("id",id).select("*").single();if(error)throw error;return map(data)}
