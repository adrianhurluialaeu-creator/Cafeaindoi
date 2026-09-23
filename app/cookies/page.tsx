import MobileNav from "../../components/MobileNav";
import Image from "next/image"; import Link from "next/link";
export const metadata={title:"Politica privind cookies",description:"Informații despre cookie-urile necesare, măsurarea Google Ads și opțiunile tale de consimțământ.",alternates:{canonical:"/cookies"}};
export default function Page(){return <><header><div className="wrap"><nav><Link className="brand logo-link" href="/" aria-label="Cafea în Doi — pagina principală"><Image className="site-logo" src="/images/ChatGPT Image 20 sept. 2026, 20_47_04.png" width={1536} height={512} alt="Cafea în Doi — Mai mult decât o cafea"/></Link><div className="links"><Link href="/">Acasă</Link><Link href="/povestea-mea">Povestea mea</Link><Link href="/intre-noi-doi">Între Noi Doi</Link><Link href="/blog">Gândurile mele</Link><Link href="/#invitatie">Bem o cafea?</Link><Link href="/contact">Contact</Link></div><MobileNav/></nav></div></header><main className="story"><h1>Cookies</h1>
<p><strong>Ultima actualizare: 22 septembrie 2026</strong></p>
<h2>1. Ce sunt cookie-urile</h2>
<p>Cookie-urile și tehnologiile similare sunt mici informații pe care un site le poate salva sau citi pe dispozitiv pentru funcționare, preferințe, securitate, analiză sau publicitate.</p>
<h2>2. Situația actuală a Cafea în Doi</h2>
<p>Cafea în Doi folosește Google Ads pentru măsurarea eficienței campaniilor publicitare. Stocarea și utilizarea datelor opționale de publicitate și măsurare sunt implicit refuzate și sunt activate numai după alegerea explicită a utilizatorului. Infrastructura tehnică poate utiliza sau genera separat date strict necesare pentru furnizarea, securitatea și protecția site-ului împotriva abuzului.</p>
<h2>3. Cookie-uri strict necesare</h2>
<p>Dacă sunt folosite cookie-uri strict necesare pentru transmiterea comunicațiilor, securitate sau pentru o funcție solicitată explicit de utilizator, acestea pot funcționa fără consimțământ separat, în limitele legislației aplicabile.</p>
<h2>4. Analytics, publicitate și alte cookie-uri opționale</h2>
<p>Google Ads este configurat cu Consent Mode: ad_storage, ad_user_data, ad_personalization și analytics_storage sunt setate implicit la «denied» și pot fi actualizate la «granted» numai după accept. Refuzul nu blochează accesul la site. Google poate primi semnale limitate fără stocare în funcție de configurația Consent Mode și de cerințele aplicabile.</p>
<h2>5. Retragerea consimțământului</h2>
<p>Dacă vor exista tehnologii opționale bazate pe consimțământ, retragerea consimțământului va trebui să fie la fel de accesibilă ca acordarea lui. Utilizatorul va putea continua să acceseze funcțiile care nu depind de tehnologiile opționale.</p>
<h2>6. Setările browserului</h2>
<p>Poți șterge sau bloca cookie-urile din setările browserului. Blocarea tehnologiilor strict necesare poate afecta funcționarea unor caracteristici ale site-ului.</p>
<h2>7. Actualizări</h2>
<p>Această pagină va fi actualizată dacă se schimbă tehnologiile utilizate de Cafea în Doi.</p>
</main><footer><div className="wrap footer"><span>© 2026 Cafea în Doi</span><div className="links"><Link href="/termeni">Termeni</Link><Link href="/confidentialitate">Confidențialitate</Link><Link href="/cookies">Cookies</Link><Link href="/contact">Contact</Link></div></div></footer></>}
