import AdminShell from "../../../components/AdminShell";
import AdminStatistics from "../../../components/AdminStatistics";
export const metadata={title:"Statistici · Admin",robots:{index:false,follow:false}};
export default function Page(){return <AdminShell title="Statistici" subtitle="Trafic, conversii și activitate — de la prima vizită până la apelul audio."><AdminStatistics/></AdminShell>}
