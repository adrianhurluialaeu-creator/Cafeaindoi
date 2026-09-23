import {NextRequest,NextResponse} from "next/server";
import {authorized} from "../invitatii/route";
import {whatsappConfigured} from "../../../../lib/whatsapp-confirmation";
export const runtime="nodejs";
export async function GET(req:NextRequest){if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});return NextResponse.json({configured:whatsappConfigured(),templateName:process.env.META_WHATSAPP_TEMPLATE_NAME||null},{headers:{"Cache-Control":"private, no-store"}})}
