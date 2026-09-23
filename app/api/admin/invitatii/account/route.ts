import {NextRequest,NextResponse} from "next/server";
import {authorized} from "../route";
import {readInvitation,updatePortalAccess} from "../../../../../lib/invitations";
import {createPortalActivation} from "../../../../../lib/portal-auth";
import {sendPortalActivationEmail} from "../../../../../lib/portal-email";
export const runtime="nodejs";
export async function POST(req:NextRequest){if(!authorized(req))return NextResponse.json({error:"Unauthorized"},{status:401});try{const {id}=await req.json();if(typeof id!=="string"||!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"ID invalid."},{status:400});const invitation=await readInvitation(id);if(!invitation?.email)return NextResponse.json({error:"Invitația nu are o adresă de email."},{status:409});const token=await createPortalActivation(id,invitation.email);await sendPortalActivationEmail({email:invitation.email,name:invitation.prenume,invitationId:id,token});return NextResponse.json({invitation:await updatePortalAccess(id,"invited")})}catch(error){console.error("[portal/account] INVITE_ERROR",error);return NextResponse.json({error:(error as Error).message||"Invitația nu a putut fi trimisă."},{status:502})}}
