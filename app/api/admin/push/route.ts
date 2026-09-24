import {NextRequest,NextResponse} from "next/server";
import {authorized} from "../invitatii/route";
import {deleteSubscription,getPushKeys,saveSubscription,sendPush,validateSubscription} from "../../../../lib/push";
export const runtime="nodejs";
export async function GET(req:NextRequest){if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});try{const keys=await getPushKeys();return NextResponse.json({configured:true,publicKey:keys.publicKey},{headers:{"Cache-Control":"private, no-store"}})}catch(error){console.error("[admin/push] KEYS_ERROR",error);return NextResponse.json({error:"Cheile push nu pot fi create."},{status:503})}}
export async function POST(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{const input=await req.json();if(input?.test===true){const result=await sendPush("Cafea în Doi","Notificările pe telefon funcționează.",{url:"/admin/setari",tag:"test-notificari"});return NextResponse.json(result)}
 if(!validateSubscription(input))return NextResponse.json({error:"Abonament invalid."},{status:400});await saveSubscription({...input,createdAt:new Date().toISOString()});return NextResponse.json({ok:true})}
 catch(error){console.error("[admin/push] SAVE_ERROR",error);return NextResponse.json({error:"Notificările nu au putut fi activate."},{status:503})}
}
export async function DELETE(req:NextRequest){if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});try{const {endpoint}=await req.json();if(typeof endpoint!=="string")return NextResponse.json({error:"Date invalide."},{status:400});await deleteSubscription(endpoint);return NextResponse.json({ok:true})}catch{return NextResponse.json({error:"Dezactivarea a eșuat."},{status:503})}}
