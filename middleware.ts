import {NextRequest,NextResponse} from "next/server";import crypto from "crypto";
const COOKIE="cafeaindoi_admin";
function token(){const p=process.env.ADMIN_PASSWORD||"";return crypto.createHash("sha256").update("cafeaindoi:"+p).digest("hex")}
export function middleware(req:NextRequest){const path=req.nextUrl.pathname;if(!path.startsWith("/admin"))return NextResponse.next();if(path==="/admin/login")return NextResponse.next();const ok=req.cookies.get(COOKIE)?.value===token()&&!!process.env.ADMIN_PASSWORD;if(ok)return NextResponse.next();const u=req.nextUrl.clone();u.pathname="/admin/login";u.searchParams.set("next",path);return NextResponse.redirect(u)}
export const config={matcher:["/admin/:path*"]};