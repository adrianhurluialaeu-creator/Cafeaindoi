import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import OurStoryPortal from "../../components/OurStoryPortal";
import {PORTAL_COOKIE,verifyPortalSession} from "../../lib/portal-auth";
import {readInvitation} from "../../lib/invitations";
export const metadata={title:"Povestea noastră",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function Page(){const id=verifyPortalSession((await cookies()).get(PORTAL_COOKIE)?.value);if(!id)redirect("/povestea-noastra/login");const invitation=await readInvitation(id);if(!invitation||invitation.portalAccessStatus!=="active")redirect("/povestea-noastra/login");return <OurStoryPortal initial={invitation}/>}
