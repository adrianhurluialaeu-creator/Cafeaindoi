import Link from "next/link";
import {PortalLoginForm} from "../../../components/PortalAuthForm";
export const metadata={title:"Autentificare · Povestea noastră",robots:{index:false,follow:false}};
export default function Page(){return <main className="portal-auth"><Link href="/">← Cafea în Doi</Link><div className="portal-auth-card"><span className="eyebrow">Spațiu privat</span><h1>Povestea noastră</h1><p>Contul este disponibil numai după acceptarea invitației de către Adrian.</p><PortalLoginForm/></div></main>}
