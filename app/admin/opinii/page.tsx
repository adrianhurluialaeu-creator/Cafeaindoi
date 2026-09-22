import Link from "next/link";
import OpinionModeration from "../../../components/OpinionModeration";

export const metadata={title:"Moderare opinii",robots:{index:false,follow:false}};

export default function Page(){
 return <main className="story">
  <div className="eyebrow">Cafea în Doi · Admin</div>
  <h1>Moderare opinii</h1>
  <p>Aprobă, respinge, retrage sau șterge opiniile trimise sub articole.</p>
  <p><Link href="/admin/profil-compatibilitate">← Profil compatibilitate</Link></p>
  <OpinionModeration/>
 </main>;
}
