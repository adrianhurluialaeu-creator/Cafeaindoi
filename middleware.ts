import {NextRequest,NextResponse} from "next/server";

const COOKIE="cafeaindoi_admin";

async function validAdminCookie(req:NextRequest){
 const password=process.env.ADMIN_PASSWORD;
 const value=req.cookies.get(COOKIE)?.value;
 if(!password||!value||!/^[a-f0-9]{64}$/.test(value))return false;
 const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("cafeaindoi:"+password));
 const expected=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,"0")).join("");
 return value===expected;
}

export async function middleware(req:NextRequest){
 const path=req.nextUrl.pathname;
 if(path==="/admin/login"||await validAdminCookie(req))return NextResponse.next();
 const u=req.nextUrl.clone();
 u.pathname="/admin/login";
 u.searchParams.set("next",path);
 return NextResponse.redirect(u);
}

export const config={matcher:["/admin/:path*"]};
