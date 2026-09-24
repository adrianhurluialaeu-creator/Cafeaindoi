import {createSupabaseAdmin} from "./supabase";
import {mergeAdminSettings} from "./admin-settings-schema";
export {defaultAdminSettings,mergeAdminSettings,validateSettingsSection} from "./admin-settings-schema";
export type {AdminSettings} from "./admin-settings-schema";
export const SETTINGS_KEY="admin_settings_v1";
export async function getAdminSettings(){const {data,error}=await createSupabaseAdmin().from("app_settings").select("value").eq("key",SETTINGS_KEY).maybeSingle();if(error)throw error;return mergeAdminSettings(data?.value)}
