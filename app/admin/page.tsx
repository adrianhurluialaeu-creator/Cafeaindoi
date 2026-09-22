import AdminShell from "../../components/AdminShell";
import AdminOverview from "../../components/AdminOverview";
export const metadata={title:"Administrare",robots:{index:false,follow:false}};
export default function Page(){
 return <AdminShell title="Overview" subtitle="Un singur loc pentru administrarea Cafea în Doi.">
  <AdminOverview/>
 </AdminShell>;
}
