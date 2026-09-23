import AdminShell from "../../../components/AdminShell";
import InvitationAdmin from "../../../components/InvitationAdmin";
export const metadata={title:"Invitații · Admin",robots:{index:false,follow:false}};
export default function Page(){return <AdminShell title="Invitații" subtitle="Gestionează invitațiile primite prin formular."><InvitationAdmin/></AdminShell>}
