import Link from "next/link";
import MobileNav from "../../components/MobileNav";
import {countDeclarationLikes,listDeclarations} from "../../lib/declarations";

export const metadata={title:"Declarații de dragoste",description:"Declarații de dragoste, dor, promisiuni și gânduri scrise de Adrian — Cafea în Doi.",alternates:{canonical:"/declaratii"}};
export const dynamic="force-dynamic";

const logo="/images/ChatGPT Image 20 sept. 2026, 20_47_04.webp";

export default async function Page(){
 const declarations=await listDeclarations("published");
 const rows=await Promise.all(declarations.map(async d=>({...d,likes:await countDeclarationLikes(d.slug)})));
 return <>
  <header><div className="wrap"><nav><Link className="brand logo-link" href="/"><img className="site-logo" src={logo} alt="Cafea în Doi"/></Link><div className="links"><Link href="/povestea-mea">Povestea mea</Link><Link href="/blog">Gândurile mele</Link><Link href="/declaratii">Declarații</Link><Link href="/intre-noi-doi">Între Noi Doi</Link><Link href="/contact">Contact</Link></div><MobileNav/></nav></div></header>
  <main className="declarations-page">
   <section className="declarations-hero">
    <div className="eyebrow">Cafea în Doi · Cuvinte scrise de mine</div>
    <h1>Declarații de dragoste</h1>
    <p>Gânduri despre dragoste, dor, apropiere și lucrurile pe care uneori le simțim mai ușor decât le spunem.</p>
   </section>
   {rows.length?<section className="declarations-grid">
    {rows.map(d=><Link className="declaration-card-public" href={"/declaratii/"+d.slug} key={d.id}>
     {d.imageUrl&&<img src={d.imageUrl} alt=""/>}
     <div className="declaration-card-body"><span className="declaration-category">{d.category}</span><h2>{d.title}</h2><p>{d.text.length>220?d.text.slice(0,220)+"…":d.text}</p><div className="declaration-card-foot"><span>♡ {d.likes}</span><span>{new Date(d.publishedAt||d.createdAt).toLocaleDateString("ro-RO")}</span></div></div>
    </Link>)}
   </section>:<section className="declarations-empty"><h2>Prima declarație urmează.</h2><p>Aici vor apărea declarațiile pe care le public.</p></section>}
  </main>
  <footer><div className="wrap footer"><span>© 2026 Cafea în Doi</span><div className="links"><Link href="/blog">Gândurile mele</Link><Link href="/declaratii">Declarații</Link><Link href="/confidentialitate">Confidențialitate</Link><Link href="/contact">Contact</Link></div></div></footer>
 </>;
}
