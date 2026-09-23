import Link from "next/link";
import {PortalActivationForm} from "../../../components/PortalAuthForm";
export const metadata={title:"Activează contul · Povestea noastră",robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{id?:string;token?:string}>}){const p=await searchParams;return <main className="portal-auth"><Link href="/">← Cafea în Doi</Link><div className="portal-auth-card"><span className="eyebrow">Invitație acceptată</span><h1>Activează Povestea noastră</h1><p>Alege o parolă pentru spațiul tău privat. Linkul de activare poate fi folosit o singură dată.</p>{p.id&&p.token?<PortalActivationForm id={p.id} token={p.token}/>:<p className="formerror">Linkul de activare este incomplet.</p>}</div></main>}
