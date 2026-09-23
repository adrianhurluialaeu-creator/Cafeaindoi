import {NextResponse} from "next/server";
import {availableSlots,getSchedule} from "../../../lib/schedule";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){try{return NextResponse.json({enabled:(await getSchedule()).enabled,slots:await availableSlots()},{headers:{"Cache-Control":"no-store"}})}catch(error){console.error("[program] LIST_ERROR",error);return NextResponse.json({error:"Programul nu este disponibil momentan."},{status:503})}}
