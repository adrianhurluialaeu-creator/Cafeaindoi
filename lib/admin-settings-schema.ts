export type AdminSettings={
 general:{siteName:string;siteDescription:string;timezone:string;contactEmail:string;maintenanceMode:boolean;maintenanceMessage:string};
 invitations:{enabled:boolean;minAge:number;mediaRequired:boolean;maxVideoSeconds:number;dailyLimit:number;successMessage:string};
 privateSpace:{sessionHours:number;retentionDays:number;messages:boolean;declarations:boolean;challenges:boolean;reactions:boolean;videoCalls:boolean;maxVideoMinutes:number};
 notifications:{push:boolean;email:boolean;onInvitation:boolean;onActivation:boolean;onMessage:boolean;onMeeting:boolean;onVideo:boolean};
 privacy:{analyticsEnabled:boolean;googleAdsEnabled:boolean;retentionDays:number;consentTitle:string;consentText:string};
};
export const defaultAdminSettings:AdminSettings={
 general:{siteName:"Cafea în Doi",siteDescription:"Prima cafea o bem online. O invitație personală pentru o relație serioasă.",timezone:"Europe/Bucharest",contactEmail:"",maintenanceMode:false,maintenanceMessage:"Revenim în curând. Pregătim ceva frumos pentru Cafea în Doi."},
 invitations:{enabled:true,minAge:18,mediaRequired:true,maxVideoSeconds:5,dailyLimit:20,successMessage:"Invitația a fost trimisă. Mulțumesc că mi-ai scris."},
 privateSpace:{sessionHours:24,retentionDays:30,messages:true,declarations:true,challenges:true,reactions:true,videoCalls:true,maxVideoMinutes:90},
 notifications:{push:true,email:true,onInvitation:true,onActivation:true,onMessage:true,onMeeting:true,onVideo:true},
 privacy:{analyticsEnabled:true,googleAdsEnabled:true,retentionDays:365,consentTitle:"Cookies pentru măsurare",consentText:"Folosim Google Ads și statistici first-party numai cu acordul tău."}
};
const text=(value:unknown,max:number)=>typeof value==="string"?value.trim().slice(0,max):"";
const integer=(value:unknown,min:number,max:number)=>Number.isInteger(Number(value))&&Number(value)>=min&&Number(value)<=max?Number(value):null;
const bool=(value:unknown)=>typeof value==="boolean"?value:null;
const object=(value:unknown):Record<string,unknown>=>value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};
export function mergeAdminSettings(value:unknown):AdminSettings{const root=object(value);return{general:{...defaultAdminSettings.general,...object(root.general)},invitations:{...defaultAdminSettings.invitations,...object(root.invitations)},privateSpace:{...defaultAdminSettings.privateSpace,...object(root.privateSpace)},notifications:{...defaultAdminSettings.notifications,...object(root.notifications)},privacy:{...defaultAdminSettings.privacy,...object(root.privacy)}} as AdminSettings}
export function validateSettingsSection(section:keyof AdminSettings,value:unknown):AdminSettings[keyof AdminSettings]|null{
 const v=object(value);
 if(section==="general"){const siteName=text(v.siteName,80),siteDescription=text(v.siteDescription,220),timezone=text(v.timezone,80),contactEmail=text(v.contactEmail,254),maintenanceMode=bool(v.maintenanceMode),maintenanceMessage=text(v.maintenanceMessage,300);if(!siteName||!siteDescription||!timezone||maintenanceMode===null||!maintenanceMessage||(contactEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)))return null;return{siteName,siteDescription,timezone,contactEmail,maintenanceMode,maintenanceMessage}}
 if(section==="invitations"){const enabled=bool(v.enabled),minAge=integer(v.minAge,18,99),mediaRequired=bool(v.mediaRequired),maxVideoSeconds=integer(v.maxVideoSeconds,1,30),dailyLimit=integer(v.dailyLimit,1,500),successMessage=text(v.successMessage,300);if(enabled===null||minAge===null||mediaRequired===null||maxVideoSeconds===null||dailyLimit===null||!successMessage)return null;return{enabled,minAge,mediaRequired,maxVideoSeconds,dailyLimit,successMessage}}
 if(section==="privateSpace"){const sessionHours=integer(v.sessionHours,1,720),retentionDays=integer(v.retentionDays,1,365),messages=bool(v.messages),declarations=bool(v.declarations),challenges=bool(v.challenges),reactions=bool(v.reactions),videoCalls=bool(v.videoCalls),maxVideoMinutes=integer(v.maxVideoMinutes,5,240);if(sessionHours===null||retentionDays===null||messages===null||declarations===null||challenges===null||reactions===null||videoCalls===null||maxVideoMinutes===null)return null;return{sessionHours,retentionDays,messages,declarations,challenges,reactions,videoCalls,maxVideoMinutes}}
 if(section==="notifications"){const keys=["push","email","onInvitation","onActivation","onMessage","onMeeting","onVideo"] as const,result={} as AdminSettings["notifications"];for(const key of keys){const item=bool(v[key]);if(item===null)return null;result[key]=item}return result}
 const analyticsEnabled=bool(v.analyticsEnabled),googleAdsEnabled=bool(v.googleAdsEnabled),retentionDays=integer(v.retentionDays,30,730),consentTitle=text(v.consentTitle,100),consentText=text(v.consentText,300);if(analyticsEnabled===null||googleAdsEnabled===null||retentionDays===null||!consentTitle||!consentText)return null;return{analyticsEnabled,googleAdsEnabled,retentionDays,consentTitle,consentText};
}
