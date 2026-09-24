import {NextRequest} from "next/server";
import {authorized} from "../../../../lib/admin-auth";
import {PORTAL_COOKIE,verifyPortalSession} from "../../../../lib/portal-auth";
import {createSupabaseAdmin} from "../../../../lib/supabase";
import {canOpenConversationStream,validConversationId} from "../../../../lib/realtime-security";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=300;

export async function GET(req:NextRequest){
 const id=req.nextUrl.searchParams.get("id"),role=req.nextUrl.searchParams.get("role");
 if(!validConversationId(id)||!['adrian','ea'].includes(role||""))return new Response("Cerere invalidă.",{status:400});
 const permitted=canOpenConversationStream(role,id,authorized(req),verifyPortalSession(req.cookies.get(PORTAL_COOKIE)?.value));
 if(!permitted)return new Response("Unauthorized",{status:401});

 const encoder=new TextEncoder(),db=createSupabaseAdmin();
 let channel:ReturnType<typeof db.channel>|null=null,heartbeat:ReturnType<typeof setInterval>|null=null,closed=false;
 const cleanup=()=>{if(closed)return;closed=true;if(heartbeat)clearInterval(heartbeat);if(channel)void db.removeChannel(channel)};
 const stream=new ReadableStream<Uint8Array>({
  start(controller){
   const send=(event:string,data:string)=>{if(!closed)try{controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`))}catch{cleanup()}};
   send("connected","{}");
   heartbeat=setInterval(()=>send("ping","{}"),20000);
   channel=db.channel(`server-conversation:${id}:${crypto.randomUUID()}`)
    .on("postgres_changes",{event:"UPDATE",schema:"public",table:"conversations",filter:`id=eq.${id}`},()=>send("changed",JSON.stringify({conversationId:id})))
    .subscribe(status=>{if(status==="SUBSCRIBED")send("ready","{}");if(status==="CHANNEL_ERROR")send("error",JSON.stringify({retry:true}))});
   req.signal.addEventListener("abort",()=>{cleanup();try{controller.close()}catch{}},{once:true});
  },
  cancel(){cleanup()}
 });
 return new Response(stream,{headers:{"Content-Type":"text/event-stream; charset=utf-8","Cache-Control":"private, no-cache, no-transform","Connection":"keep-alive","X-Accel-Buffering":"no","Content-Encoding":"none"}});
}
