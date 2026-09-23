import MobileNav from "../../components/MobileNav";
import Image from "next/image"; import Link from "next/link";
export const metadata={title:"Termeni și condiții",description:"Condițiile de utilizare ale site-ului Cafea în Doi și regulile pentru trimiterea unei invitații.",alternates:{canonical:"/termeni"}};
export default function Page(){return <><header><div className="wrap"><nav><Link className="brand logo-link" href="/" aria-label="Cafea în Doi — pagina principală"><Image className="site-logo" src="/images/ChatGPT Image 20 sept. 2026, 20_47_04.png" width={1536} height={512} alt="Cafea în Doi — Mai mult decât o cafea"/></Link><div className="links"><Link href="/">Acasă</Link><Link href="/povestea-mea">Povestea mea</Link><Link href="/intre-noi-doi">Între Noi Doi</Link><Link href="/blog">Gândurile mele</Link><Link href="/#invitatie">Bem o cafea?</Link><Link href="/contact">Contact</Link></div><MobileNav/></nav></div></header><main className="story"><h1>Termeni și condiții</h1>
<p><strong>Ultima actualizare: 20 septembrie 2026</strong></p>
<h2>1. Despre Cafea în Doi</h2>
<p>Cafea în Doi este o pagină personală, necomercială, administrată de Adrian. Scopul ei este de a permite unei persoane interesate să trimită o invitație personală și câteva informații despre sine, pentru ca Adrian să poată decide dacă dorește continuarea conversației.</p>
<h2>2. Condiția de vârstă</h2>
<p>Site-ul și formularul sunt destinate exclusiv persoanelor care au împlinit 18 ani. Prin trimiterea formularului, declari că ai cel puțin 18 ani.</p>
<h2>3. Trimiterea unei invitații</h2>
<p>Trimiterea formularului nu garantează un răspuns, o conversație, o întâlnire sau o relație și nu creează nicio obligație pentru niciuna dintre persoane. Oricare dintre părți poate decide să nu continue interacțiunea.</p>
<h2>4. Informațiile furnizate</h2>
<p>Te rugăm să furnizezi numai informații despre tine, corecte și relevante pentru invitație. Nu introduce date despre alte persoane fără dreptul de a face acest lucru și nu transmite parole, date financiare, documente de identitate, informații medicale sau alte date sensibile.</p>
<h2>5. Utilizare interzisă</h2>
<p>Nu este permisă folosirea formularului pentru hărțuire, amenințări, fraudă, spam, conținut ilegal, impersonarea altei persoane sau transmiterea de cod ori linkuri malițioase. Mesajele abuzive pot fi ignorate, șterse sau, când legea o impune, puse la dispoziția autorităților competente.</p>
<h2>6. WhatsApp și servicii externe</h2>
<p>Dacă există interes reciproc, conversația poate continua prin WhatsApp. WhatsApp este un serviciu extern, cu propriile condiții și practici de confidențialitate; Cafea în Doi nu controlează funcționarea acestui serviciu.</p>
<h2>7. Disponibilitatea site-ului</h2>
<p>Site-ul este oferit ca pagină personală și poate fi modificat, suspendat sau închis. Nu se garantează disponibilitatea neîntreruptă ori lipsa erorilor tehnice.</p>
<h2>8. Date personale</h2>
<p>Modul în care sunt prelucrate datele transmise prin formular este descris în Politica de confidențialitate. Utilizarea cookie-urilor și a tehnologiilor similare este descrisă în pagina Cookies.</p>
<h2>9. Modificarea termenilor</h2>
<p>Acești termeni pot fi actualizați atunci când se schimbă funcționalitatea site-ului sau cerințele aplicabile. Data ultimei actualizări este afișată la începutul paginii.</p>
<h2>10. Contact</h2>
<p>Pentru întrebări privind site-ul sau acești termeni, folosește datele indicate în pagina Contact.</p>
</main><footer><div className="wrap footer"><span>© 2026 Cafea în Doi</span><div className="links"><Link href="/termeni">Termeni</Link><Link href="/confidentialitate">Confidențialitate</Link><Link href="/cookies">Cookies</Link><Link href="/contact">Contact</Link></div></div></footer></>}
