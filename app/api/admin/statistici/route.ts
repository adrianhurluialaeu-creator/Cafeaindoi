import {NextRequest,NextResponse} from "next/server";
import {authorized} from "../../../../lib/admin-auth";
import {createSupabaseAdmin} from "../../../../lib/supabase";

export const runtime="nodejs";
export const dynamic="force-dynamic";

type SessionRow={id:string;visitor_hash:string;started_at:string;utm_source:string|null;utm_medium:string|null;utm_campaign:string|null;gclid:string|null;referrer_host:string|null;device_type:string};
type EventRow={session_id:string;event_name:string;path:string;created_at:string;metadata:Record<string,unknown>};
type DatedRow={id:string;created_at:string;[key:string]:unknown};
type MeetingRow={id:string;created_at:string;status:string;room_name:string|null};
const rangeDays=(value:string|null)=>value==="7"?7:value==="90"?90:value==="all"?0:30;
const iso=(date:Date)=>date.toISOString();
function sourceName(row:SessionRow){
 if(row.gclid)return "Google Ads";
 const source=(row.utm_source||"").toLowerCase(),medium=(row.utm_medium||"").toLowerCase();
 if(source.includes("google"))return medium.includes("cpc")||medium.includes("paid")?"Google Ads":"Google organic";
 if(source.includes("facebook")||source.includes("instagram")||source.includes("meta"))return "Facebook / Instagram";
 if(row.utm_source)return row.utm_source.slice(0,50);
 if(row.referrer_host&&!row.referrer_host.includes("cafeaindoi.eu"))return row.referrer_host;
 return "Direct";
}
function percentChange(current:number,previous:number){if(!previous)return current?100:0;return Math.round((current-previous)/previous*100)}

async function load(since:string,until?:string){
 const db=createSupabaseAdmin();
 const within=(query:any,column:string)=>{let next=query.gte(column,since);if(until)next=next.lt(column,until);return next};
 const sessionQuery=within(db.from("analytics_sessions").select("id,visitor_hash,started_at,utm_source,utm_medium,utm_campaign,gclid,referrer_host,device_type").order("started_at",{ascending:true}).limit(10000),"started_at");
 const eventQuery=within(db.from("analytics_events").select("session_id,event_name,path,created_at,metadata").order("created_at",{ascending:true}).limit(20000),"created_at");
 const invitationQuery=within(db.from("invitations").select("id,created_at,record").order("created_at",{ascending:true}).limit(5000),"created_at");
 const accountQuery=within(db.from("portal_accounts").select("invitation_id,activated_at").eq("status","active").order("activated_at",{ascending:true}).limit(5000),"activated_at");
 const conversationQuery=within(db.from("conversations").select("id,created_at").order("created_at",{ascending:true}).limit(5000),"created_at");
 const messageQuery=within(db.from("conversation_messages").select("id,created_at").order("created_at",{ascending:true}).limit(10000),"created_at");
 const meetingQuery=within(db.from("coffee_meetings").select("id,created_at,status,room_name").order("created_at",{ascending:true}).limit(5000),"created_at");
 const [sessionsResult,eventsResult,invitationsResult,accountsResult,conversationsResult,messagesResult,meetingsResult]=await Promise.all([sessionQuery,eventQuery,invitationQuery,accountQuery,conversationQuery,messageQuery,meetingQuery]);
 const analyticsAvailable=!sessionsResult.error&&!eventsResult.error;
 if(invitationsResult.error||accountsResult.error||conversationsResult.error||messagesResult.error||meetingsResult.error)throw invitationsResult.error||accountsResult.error||conversationsResult.error||messagesResult.error||meetingsResult.error;
 const sessions=(sessionsResult.data||[]) as SessionRow[],events=(eventsResult.data||[]) as EventRow[],invitations=(invitationsResult.data||[]) as DatedRow[],accounts=accountsResult.data||[],conversations=conversationsResult.data||[],messages=messagesResult.data||[],meetings=(meetingsResult.data||[]) as MeetingRow[];
 const eventCounts:Record<string,number>={};for(const event of events)eventCounts[event.event_name]=(eventCounts[event.event_name]||0)+1;
 const visitors=new Set(sessions.map(item=>item.visitor_hash)).size,pageViews=eventCounts.page_view||0;
 return {analyticsAvailable,sessions,events,invitations,accounts,conversations,messages,meetings,eventCounts,summary:{visitors,sessions:sessions.length,pageViews,invitations:invitations.length,activated:accounts.length,conversations:conversations.length,messages:messages.length,videoCalls:eventCounts.video_call_started||meetings.filter(item=>item.room_name).length,conversion:sessions.length?Number((invitations.length/sessions.length*100).toFixed(1)):0}};
}

export async function GET(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const days=rangeDays(req.nextUrl.searchParams.get("days")),end=new Date(),start=days?new Date(end.getTime()-days*864e5):new Date("2020-01-01T00:00:00.000Z"),previousStart=days?new Date(start.getTime()-days*864e5):null;
  const [current,previous]=await Promise.all([load(iso(start)),previousStart?load(iso(previousStart),iso(start)):Promise.resolve(null)]);
  const dayMap=new Map<string,{date:string;visits:number;invitations:number}>(),chartStart=days?start:new Date(end.getTime()-90*864e5);
  const cursor=new Date(chartStart);cursor.setUTCHours(0,0,0,0);while(cursor<=end){const key=cursor.toISOString().slice(0,10);dayMap.set(key,{date:key,visits:0,invitations:0});cursor.setUTCDate(cursor.getUTCDate()+1)}
  for(const item of current.sessions){const key=item.started_at.slice(0,10),row=dayMap.get(key);if(row)row.visits++}
  for(const item of current.invitations){const key=item.created_at.slice(0,10),row=dayMap.get(key);if(row)row.invitations++}
  const sourceMap=new Map<string,{source:string;sessions:number;invitations:number;campaigns:Set<string>}>();
  for(const item of current.sessions){const name=sourceName(item),row=sourceMap.get(name)||{source:name,sessions:0,invitations:0,campaigns:new Set<string>()};row.sessions++;if(item.utm_campaign)row.campaigns.add(item.utm_campaign);sourceMap.set(name,row)}
  const invitationEvents=current.events.filter(item=>item.event_name==="invitation_submitted");for(const item of invitationEvents){const session=current.sessions.find(session=>session.id===item.session_id);if(session){const row=sourceMap.get(sourceName(session));if(row)row.invitations++}}
  const pages=new Map<string,number>();for(const event of current.events)if(event.event_name==="page_view")pages.set(event.path,(pages.get(event.path)||0)+1);
  const count=(name:string)=>current.eventCounts[name]||0;
  const funnel=[
   {key:"visits",label:"Vizite pe site",value:current.summary.sessions},
   {key:"test_started",label:"Test început",value:count("compatibility_started")},
   {key:"test_completed",label:"Test finalizat",value:count("compatibility_completed")},
   {key:"form_started",label:"Invitație începută",value:count("invitation_started")},
   {key:"media",label:"Selfie / video pregătit",value:count("invitation_media_ready")},
   {key:"submitted",label:"Invitație trimisă",value:current.summary.invitations},
   {key:"activated",label:"Cont activat",value:current.summary.activated},
   {key:"conversation",label:"Conversație creată",value:current.summary.conversations},
   {key:"video",label:"Apel video început",value:current.summary.videoCalls}
  ];
  const response={range:days||"all",analyticsAvailable:current.analyticsAvailable,summary:current.summary,deltas:previous?{visitors:percentChange(current.summary.visitors,previous.summary.visitors),sessions:percentChange(current.summary.sessions,previous.summary.sessions),invitations:percentChange(current.summary.invitations,previous.summary.invitations),conversion:Number((current.summary.conversion-previous.summary.conversion).toFixed(1))}:null,trend:[...dayMap.values()],funnel,sources:[...sourceMap.values()].map(row=>({...row,campaigns:[...row.campaigns],conversion:row.sessions?Number((row.invitations/row.sessions*100).toFixed(1)):0})).sort((a,b)=>b.sessions-a.sessions).slice(0,12),pages:[...pages].map(([path,views])=>({path,views})).sort((a,b)=>b.views-a.views).slice(0,12),activity:{messages:current.summary.messages,meetings:current.meetings.length,acceptedMeetings:current.meetings.filter(item=>item.status==="acceptata").length,videoCalls:current.summary.videoCalls}};
  return NextResponse.json(response,{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){console.error("[admin/statistici] READ_ERROR",error);return NextResponse.json({error:"Statisticile nu pot fi încărcate momentan."},{status:503})}
}
