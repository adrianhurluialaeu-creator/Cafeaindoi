import AdminShell from "../../../components/AdminShell";
import OpinionModeration from "../../../components/OpinionModeration";
export const metadata={title:"Opinii · Admin",robots:{index:false,follow:false}};
export default function Page(){
 return <AdminShell title="Opinii" subtitle="Moderează opiniile trimise sub articole.">
  <OpinionModeration/>
 </AdminShell>;
}
