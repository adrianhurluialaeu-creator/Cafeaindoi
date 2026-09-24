import {NextRequest,NextResponse} from "next/server";
import {adminEmail,createAdminReset,sendAdminResetEmail} from "../../../../lib/admin-credentials";
import {consumeRateLimit,requestIp} from "../../../../lib/rate-limit";
export const runtime="nodejs";
export async function POST(req:NextRequest){const ip=requestIp(req),limit=await consumeRateLimit("admin-password-recovery",ip,3,60*60_000,{failClosed:true});if(!limit.allowed)return NextResponse.redirect(new URL("/admin/recuperare?status=rate",req.url),303);try{const fd=await req.formData(),email=String(fd.get("email")||"").trim().toLowerCase();if(email&&email===adminEmail()){const {token}=await createAdminReset();await sendAdminResetEmail(token)}return NextResponse.redirect(new URL("/admin/recuperare?status=sent",req.url),303)}catch(error){console.error("[admin/recovery] ERROR",error);return NextResponse.redirect(new URL("/admin/recuperare?status=error",req.url),303)}}
