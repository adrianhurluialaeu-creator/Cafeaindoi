import AdminShell from "../../../components/AdminShell";
import ScheduleAdmin from "../../../components/ScheduleAdmin";
export const metadata={title:"Setări · Admin",robots:{index:false,follow:false}};
export default function Page(){return <AdminShell title="Setări" subtitle="Configurează disponibilitatea pentru prima cafea."><ScheduleAdmin/></AdminShell>}
