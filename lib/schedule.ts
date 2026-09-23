import {get,put} from "@vercel/blob";
import {listInvitations} from "./invitations";

export type Schedule={enabled:boolean;days:number[];start:string;end:string;duration:30|60;blockedDates:string[]};
export type Slot={start:string;label:string};
const PATH="settings/coffee-schedule.json";
const ZONE="Europe/Berlin";
const defaults:Schedule={enabled:false,days:[1,2,3,4,5],start:"18:00",end:"20:00",duration:30,blockedDates:[]};
const parts=new Intl.DateTimeFormat("en-GB",{timeZone:ZONE,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23",weekday:"short"});
function local(instant:Date){const p=Object.fromEntries(parts.formatToParts(instant).map(x=>[x.type,x.value]));return {date:`${p.year}-${p.month}-${p.day}`,minute:Number(p.hour)*60+Number(p.minute),day:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(p.weekday)};}
const minute=(time:string)=>Number(time.slice(0,2))*60+Number(time.slice(3));
export async function getSchedule():Promise<Schedule>{const blob=await get(PATH,{access:"private",useCache:false});if(!blob||blob.statusCode!==200)return defaults;return JSON.parse(await new Response(blob.stream).text()) as Schedule}
export async function saveSchedule(value:Schedule){await put(PATH,JSON.stringify(value),{access:"private",addRandomSuffix:false,allowOverwrite:true,contentType:"application/json"});return value}
export function validateSchedule(data:any):Schedule|null{
 if(typeof data?.enabled!=="boolean"||!Array.isArray(data.days)||!data.days.every((d:unknown)=>Number.isInteger(d)&&Number(d)>=0&&Number(d)<=6)||!Array.isArray(data.blockedDates)||data.blockedDates.length>120||!data.blockedDates.every((d:unknown)=>typeof d==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d))||!/^([01]\d|2[0-3]):[0-5]\d$/.test(data.start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(data.end)||![30,60].includes(data.duration))return null;
 if(minute(data.end)<=minute(data.start)||minute(data.end)-minute(data.start)<data.duration||minute(data.start)%30||minute(data.end)%30)return null;
 return {enabled:data.enabled,days:[...new Set<number>(data.days)],start:data.start,end:data.end,duration:data.duration,blockedDates:[...new Set<string>(data.blockedDates)]};
}
export async function availableSlots(){
 const schedule=await getSchedule();
 if(!schedule.enabled)return [] as Slot[];
 const invitations=await listInvitations();
 const booked=invitations.filter(x=>x.bookingStatus==="confirmed"&&x.slotStart).map(x=>({start:Date.parse(x.slotStart!),end:Date.parse(x.slotStart!)+((x.slotDuration||30)*60_000)}));
 const now=Date.now(),slots:Slot[]=[];
 const cursor=new Date(Math.ceil((now+24*3600_000)/(30*60_000))*30*60_000);
 const until=now+15*24*3600_000;
 while(cursor.getTime()<until){
  const t=cursor.getTime(),here=local(cursor),end=local(new Date(t+schedule.duration*60_000));
  if(schedule.days.includes(here.day)&&!schedule.blockedDates.includes(here.date)&&here.date===end.date&&here.minute>=minute(schedule.start)&&end.minute<=minute(schedule.end)&&!booked.some(x=>t<x.end&&t+schedule.duration*60_000>x.start)){
   const label=new Intl.DateTimeFormat("ro-RO",{timeZone:ZONE,weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"}).format(cursor)+" (ora Germaniei)";
   slots.push({start:cursor.toISOString(),label});
  }
  cursor.setTime(t+30*60_000);
 }
 return slots;
}
