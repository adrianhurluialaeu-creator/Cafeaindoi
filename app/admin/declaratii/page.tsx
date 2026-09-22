import AdminShell from "../../../components/AdminShell";
import DeclarationAdmin from "../../../components/DeclarationAdmin";
export const metadata={title:"Declarații · Admin",robots:{index:false,follow:false}};
export default function Page(){
 return <AdminShell title="Declarații" subtitle="Scrie, editează și publică declarațiile de dragoste.">
  <DeclarationAdmin/>
 </AdminShell>;
}
