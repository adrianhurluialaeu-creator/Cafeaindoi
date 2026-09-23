import {NextRequest,NextResponse} from "next/server";
import {authorized} from "../invitatii/route";
import {getSchedule,saveSchedule,validateSchedule} from "../../../../lib/schedule";
export const runtime="nodejs";
export async function GET(req:NextRequest){if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});try{return NextResponse.json({schedule:await getSchedule()},{headers:{"Cache-Control":"private, no-store"}})}catch{return NextResponse.json({error:"Programul nu poate fi încărcat."},{status:503})}}
export async function PUT(req:NextRequest){if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});try{const schedule=validateSchedule(await req.json());if(!schedule)return NextResponse.json({error:"Verifică zilele și orele programului."},{status:400});return NextResponse.json({schedule:await saveSchedule(schedule)})}catch(error){console.error("[admin/program] SAVE_ERROR",error);return NextResponse.json({error:"Programul nu poate fi salvat."},{status:503})}}
