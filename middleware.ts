import {NextRequest,NextResponse} from "next/server";
const COOKIE="cafeaindoi_admin";
export function middleware(req:NextRequest){const path=req.nextUrl.pathname;if(!path.startsWith("/admin"))return NextResponse.next();if(path==="/admin/login")return NextResponse.next();const authenticated=!!req.cookies.get(COOKIE)?.value;if(authenticated)return NextResponse.next();const u=req.nextUrl.clone();u.pathname="/admin/login";u.searchParams.set("next",path);return NextResponse.redirect(u)}
export const config={matcher:["/admin/:path*"]};