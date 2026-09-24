import {NextRequest,NextResponse} from "next/server";
import {validAdminToken} from "./lib/admin-auth";

export function proxy(req:NextRequest){
 const path=req.nextUrl.pathname;
 if(path==="/admin/login"||validAdminToken(req.cookies.get("cafeaindoi_admin")?.value))return NextResponse.next();
 const u=req.nextUrl.clone();
 u.pathname="/admin/login";
 u.searchParams.set("next",path);
 return NextResponse.redirect(u);
}

export const config={matcher:["/admin/:path*"]};
