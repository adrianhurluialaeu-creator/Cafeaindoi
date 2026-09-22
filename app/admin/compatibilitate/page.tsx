import AdminShell from "../../../components/AdminShell";
import ProfileEditor from "../../../components/ProfileEditor";
export const metadata={title:"Compatibilitate · Admin",robots:{index:false,follow:false}};
export default function Page(){
 return <AdminShell title="Compatibilitate" subtitle="Configurează profilul de referință pentru testul „Între Noi Doi”.">
  <div className="admin-v2-card admin-v2-wide"><ProfileEditor/></div>
 </AdminShell>;
}
