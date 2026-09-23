import AdminConversationHub from "../../../components/AdminConversationHub";import AdminShell from "../../../components/AdminShell";import {listInvitations} from "../../../lib/invitations";
export const metadata={title:"Conversații · Admin",robots:{index:false,follow:false}};export const dynamic="force-dynamic";
export default async function Page(){return <AdminShell title="Conversații" subtitle="Mesagerie privată și întâlniri video Cafea în Doi."><AdminConversationHub invitations={await listInvitations()}/></AdminShell>}
