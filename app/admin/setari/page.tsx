import AdminShell from "../../../components/AdminShell";
import AdminSettingsPanel from "../../../components/AdminSettingsPanel";
export const metadata={title:"Setări · Admin",robots:{index:false,follow:false}};
export default function Page(){return <AdminShell title="Setări" subtitle="Controlează site-ul, invitațiile, experiența privată și integrările."><AdminSettingsPanel/></AdminShell>}
