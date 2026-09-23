import MobileNav from "../components/MobileNav";
import InvitationForm from "../components/InvitationForm";
import Image from "next/image";
import Link from "next/link";
import {listDeclarations} from "../lib/declarations";

export const metadata={alternates:{canonical:"/"}};
const logo="/images/ChatGPT Image 20 sept. 2026, 20_47_04.webp";

const startHere=[
 {href:"/blog/ce-caut-la-femeia-cu-care-mi-as-construi-viata",icon:"❤️",title:"Ce caut într-o relație",text:"Valorile și direcția comună pe care mi le doresc."},
 {href:"/blog/ce-inseamna-familia-pentru-mine",icon:"👨‍👩‍👧",title:"Ce înseamnă familia",text:"Cum văd responsabilitatea, copiii și stabilitatea."},
 {href:"/blog/cum-cred-ca-trebuie-rezolvata-o-cearta-in-cuplu",icon:"💬",title:"Cum comunic într-un conflict",text:"Dialog direct, respect și repararea apropierii."},
 {href:"/blog/banii-intr-o-relatie-ai-mei-ai-tai-sau-ai-nostri",icon:"💶",title:"Cum văd banii în cuplu",text:"Transparență, autonomie și obiective construite împreună."},
 {href:"/blog/cum-arata-o-zi-obisnuita-cu-adrian",icon:"☕",title:"O zi obișnuită cu mine",text:"Muncă, casă, proiecte, timp personal și umor."},
 {href:"/blog/micile-mele-defecte-manual-neoficial-de-utilizare-pentru-adrian",icon:"🙂",title:"Micile mele defecte",text:"O prezentare sinceră, cu puțină autoironie."}
];

export default async function Home(){
 let declarations:any[]=[];
 try{declarations=(await listDeclarations("published")).slice(0,3)}catch{}
 return <>
  <header><div className="wrap"><nav><Link href="/" className="brand logo-link" aria-label="Cafea în Doi — pagina principală"><Image className="site-logo" src={logo} width={1536} height={512} priority alt="Cafea în Doi — Mai mult decât o cafea"/></Link><div className="links"><Link href="/povestea-mea">Povestea mea</Link><Link href="/intre-noi-doi">Între Noi Doi</Link><Link href="/blog">Gândurile mele</Link><Link href="/declaratii">Declarații</Link><Link href="/contact">Contact</Link></div><MobileNav/></nav></div></header>
  <main className="wrap hero">
   <section className="profile"><Image className="portrait" src="/images/01_cafea_in_doi.webp" width={800} height={1200} priority alt="Adrian — Cafea în Doi"/><div><div className="eyebrow">cafeaindoi.eu</div><h1>Cafea în Doi</h1><div className="tag">Prima cafea o bem online.</div><div className="home-purpose"><h2>Cunoaște-mă înainte să bem cafeaua</h2><p>Am creat acest loc pentru ca tu să afli cine sunt, cum gândesc și ce îmi doresc de la o relație. Citește în ritmul tău. Dacă simți că avem lucruri importante în comun, putem continua conversația la o cafea.</p></div><p><b>Salut, sunt Adrian.</b> Am 39 de ani, sunt român și locuiesc în Germania. Sunt tată, lucrez ca sudor, sunt pasionat de IT și îmi construiesc propriile planuri pentru viitor.</p><p><span className="pill">🇷🇴 Român</span><span className="pill">🇩🇪 Germania</span><span className="pill">🚭 Nu fumez</span><span className="pill">🥂 Fără alcool</span></p><div className="quote">Nu caut sute de match-uri. Caut o singură persoană potrivită.</div><Link className="btn alt" href="/povestea-mea">❤️ Citește povestea mea</Link></div></section>
   <section className="card" id="invitatie"><div className="eyebrow">invitație personală</div><h2>☕ Bem o cafea?</h2><p>Dacă și tu cauți o relație serioasă, spune-mi câteva lucruri despre tine. Dacă există interes reciproc, continuăm pe WhatsApp.</p><InvitationForm/></section>
  </main>
  <section className="wrap journey-public" aria-labelledby="journey-title"><div className="journey-public-head"><div className="eyebrow">Pas cu pas, fără grabă</div><h2 id="journey-title">Cum poate evolua povestea noastră</h2><p>Putem avea oricâte conversații online avem nevoie. Următorul pas apare numai dacă ne dorim amândoi.</p></div><ol className="journey-public-grid"><li><b>1</b><span>📨</span><div><h3>Îmi trimiți invitația</h3><p>Formular în trei pași și verificare live privată.</p></div></li><li><b>2</b><span>☕</span><div><h3>Ne descoperim online</h3><p>Avem cafele video și ne propunem reciproc mici provocări: gătit, organizare sau planificarea unui weekend.</p></div></li><li><b>3</b><span>🚆</span><div><h3>Vin eu în orașul tău</h3><p>Prima întâlnire fizică are loc într-un spațiu public ales împreună.</p></div></li><li><b>4</b><span>🤝</span><div><h3>Vii tu în orașul meu</h3><p>Doar după ce ne-am cunoscut și există suficientă încredere.</p></div></li><li><b>5</b><span>🧳</span><div><h3>Trăim prima experiență împreună</h3><p>Alegem o excursie, un weekend sau o activitate de câteva zile, planificată de amândoi.</p></div></li></ol><p className="journey-public-note">Nu este un examen. Provocările sunt reciproce și opționale, iar fiecare etapă continuă numai prin acordul amândurora. Locația exactă este transmisă privat după confirmare.</p></section>
  <section className="wrap start-here" aria-labelledby="start-here-title"><div className="start-here-head"><div><div className="eyebrow">Un traseu scurt</div><h2 id="start-here-title">Începe de aici</h2><p>Șase lucruri importante despre mine, înainte să explorezi toate articolele.</p></div><Link href="/blog">Vezi toate gândurile →</Link></div><div className="start-here-grid">{startHere.map(item=><Link className="start-here-card" href={item.href} key={item.href}><span aria-hidden="true">{item.icon}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></Link>)}</div></section>
  {declarations.length>0&&<section className="wrap declaration-home"><div className="declaration-home-head"><div><div className="eyebrow">Cuvinte scrise de mine</div><h2>Ultimele declarații</h2></div><Link href="/declaratii">Vezi toate →</Link></div><div className="declaration-home-grid">{declarations.map((d:any)=><Link key={d.id} className="declaration-home-card" href={"/declaratii/"+d.slug}><span>{d.category}</span><h3>{d.title}</h3><p>{d.text.length>150?d.text.slice(0,150)+"…":d.text}</p></Link>)}</div></section>}
  <Footer/>
 </>;
}

function Footer(){return <footer><div className="wrap footer"><span>© 2026 Cafea în Doi</span><div className="links"><Link href="/povestea-noastra/login">Povestea noastră</Link><Link href="/termeni">Termeni</Link><Link href="/confidentialitate">Confidențialitate</Link><Link href="/cookies">Cookies</Link><Link href="/contact">Contact</Link></div></div></footer>}
