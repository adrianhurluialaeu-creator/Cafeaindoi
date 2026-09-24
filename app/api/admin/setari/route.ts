import {NextRequest,NextResponse} from "next/server";
import {authorized} from "../../../../lib/admin-auth";
import {AdminSettings,defaultAdminSettings,getAdminSettings,SETTINGS_KEY,validateSettingsSection} from "../../../../lib/admin-settings";
import {createSupabaseAdmin} from "../../../../lib/supabase";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const sections=new Set<keyof AdminSettings>(["general","invitations","privateSpace","notifications","privacy"]);
const AUDIT_KEY="settings_audit_v1";
type AuditEntry={id:number;section:string;changed_at:string};

function integrations(settings:AdminSettings){
 return [
  {key:"supabase",label:"Supabase",configured:Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY&&process.env.SUPABASE_SERVICE_ROLE_KEY),detail:"Bază de date, autentificare și stocare"},
  {key:"resend",label:"Resend",configured:Boolean(process.env.RESEND_API_KEY_V2||process.env.RESEND_API_KEY),detail:"Emailuri tranzacționale"},
  {key:"google",label:"Google Ads",configured:settings.privacy.googleAdsEnabled,detail:"Conversii și campanii"},
  {key:"video",label:"Apel video",configured:Boolean(process.env.METERED_DOMAIN&&process.env.METERED_SECRET_KEY),detail:"Camere video private"},
  {key:"vercel",label:"Vercel",configured:Boolean(process.env.VERCEL||process.env.VERCEL_ENV),detail:"Hosting și deployment"}
 ];
}

export async function GET(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const settings=await getAdminSettings(),db=createSupabaseAdmin(),{data:audit}=await db.from("app_settings").select("value").eq("key",AUDIT_KEY).maybeSingle();
  return NextResponse.json({settings,integrations:integrations(settings),audit:Array.isArray(audit?.value)?audit.value:[],system:{environment:process.env.VERCEL_ENV||process.env.NODE_ENV||"unknown",database:"connected",rls:"active"}},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){console.error("[admin/setari] GET_ERROR",error);return NextResponse.json({error:"Setările nu pot fi încărcate momentan."},{status:503})}
}

export async function PUT(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const body=await req.json(),section=body.section as keyof AdminSettings;
  if(!sections.has(section))return NextResponse.json({error:"Secțiune necunoscută."},{status:400});
  const value=validateSettingsSection(section,body.value);if(!value)return NextResponse.json({error:"Verifică valorile introduse."},{status:400});
  const current=await getAdminSettings(),next={...current,[section]:value},db=createSupabaseAdmin(),now=new Date().toISOString();
  const {error}=await db.from("app_settings").upsert({key:SETTINGS_KEY,value:next,updated_at:now});if(error)throw error;
  const {data:auditRow}=await db.from("app_settings").select("value").eq("key",AUDIT_KEY).maybeSingle(),audit=Array.isArray(auditRow?.value)?auditRow.value as AuditEntry[]:[];
  const entry:AuditEntry={id:Date.now(),section,changed_at:now},{error:auditError}=await db.from("app_settings").upsert({key:AUDIT_KEY,value:[entry,...audit].slice(0,50),updated_at:now});if(auditError)console.error("[admin/setari] AUDIT_ERROR",auditError);
  return NextResponse.json({settings:next,integrations:integrations(next)});
 }catch(error){console.error("[admin/setari] PUT_ERROR",error);return NextResponse.json({error:"Setările nu au putut fi salvate."},{status:503})}
}

export async function DELETE(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const body=await req.json();if(body.action!=="clear_analytics"||body.confirmation!=="ȘTERGE STATISTICILE")return NextResponse.json({error:"Confirmarea nu este validă."},{status:400});
  const db=createSupabaseAdmin(),{error}=await db.from("analytics_sessions").delete().not("id","is",null);if(error)throw error;
  const now=new Date().toISOString(),{data:auditRow}=await db.from("app_settings").select("value").eq("key",AUDIT_KEY).maybeSingle(),audit=Array.isArray(auditRow?.value)?auditRow.value as AuditEntry[]:[];
  await db.from("app_settings").upsert({key:AUDIT_KEY,value:[{id:Date.now(),section:"privacy",changed_at:now},...audit].slice(0,50),updated_at:now});
  return NextResponse.json({ok:true});
 }catch(error){console.error("[admin/setari] DELETE_ERROR",error);return NextResponse.json({error:"Datele analytics nu au putut fi șterse."},{status:503})}
}
