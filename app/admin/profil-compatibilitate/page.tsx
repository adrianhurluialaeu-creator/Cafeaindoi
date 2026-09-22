import Link from "next/link";
import ProfileEditor from "../../../components/ProfileEditor";
export const metadata={title:"Configurare profil",robots:{index:false,follow:false}};
export default function Page(){return <main className="story"><h1>Configurare profil Adrian</h1><p>Această pagină este pentru configurarea profilului de referință al testului „Între Noi Doi”.</p><p><Link href="/admin/opinii">Moderează opiniile cititorilor →</Link></p><ProfileEditor/></main>}