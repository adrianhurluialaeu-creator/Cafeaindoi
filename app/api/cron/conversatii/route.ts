import {NextRequest,NextResponse} from "next/server";
import {purgeExpiredConversations} from "../../../../lib/conversation";
import {cleanupPendingMedia} from "../../../../lib/invitation-media";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
 const secret=process.env.CRON_SECRET,authorization=req.headers.get("authorization"),vercelCron=req.headers.get("user-agent")==="vercel-cron/1.0";
 if(secret?authorization!==`Bearer ${secret}`:!vercelCron)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{const [purged,abandonedUploads]=await Promise.all([purgeExpiredConversations(),cleanupPendingMedia()]);return NextResponse.json({ok:true,purged,abandonedUploads})}
 catch(error){console.error("[conversation-cron] PURGE_ERROR",error);return NextResponse.json({error:"Curățarea conversațiilor a eșuat."},{status:500})}
}
