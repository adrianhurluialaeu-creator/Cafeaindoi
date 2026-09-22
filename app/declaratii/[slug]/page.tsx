import Link from "next/link";
import {notFound} from "next/navigation";
import MobileNav from "../../../components/MobileNav";
import DeclarationInteractions from "../../../components/DeclarationInteractions";
import {countDeclarationLikes,getPublishedDeclarationBySlug} from "../../../lib/declarations";

export const dynamic="force-dynamic";
const logo="/images/ChatGPT Image 20 sept. 2026, 20_47_04.png";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const d=await getPublishedDeclarationBySlug(slug);
 if(!d)return {title:"Declarație"};
 return {title:d.title,description:d.text.slice(0,155),alternates:{canonical:"/declaratii/"+d.slug}};
}

export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const d=await getPublishedDeclarationBySlug(slug);
 if(!d)notFound();
 const likes=await countDeclarationLikes(d.slug);
 return <>
  <header><div className="wrap"><nav><Link className="brand logo-link" href="/"><img className="site-logo" src={logo} alt="Cafea în Doi"/></Link><div className="links"><Link href="/">Acasă</Link><Link href="/blog">Gândurile mele</Link><Link href="/declaratii">Declarații</Link><Link href="/intre-noi-doi">Între Noi Doi</Link><Link href="/contact">Contact</Link></div><MobileNav/></nav></div></header>
  <main className="declaration-detail">
   <article className="declaration-letter">
    <Link className="declaration-back" href="/declaratii">← Toate declarațiile</Link>
    <span className="declaration-category">{d.category}</span>
    <h1>{d.title}</h1>
    <div className="declaration-date">{new Date(d.publishedAt||d.createdAt).toLocaleDateString("ro-RO",{day:"numeric",month:"long",year:"numeric"})}</div>
    {d.imageUrl&&<img className="declaration-hero-image" src={d.imageUrl} alt=""/>}
    <div className="declaration-text">{d.text.split(/\n{2,}/).map((p,i)=><p key={i}>{p}</p>)}</div>
    <div className="declaration-signature">— Adrian</div>
   </article>
   <DeclarationInteractions slug={d.slug} title={d.title} initialLikes={likes}/>
  </main>
  <footer><div className="wrap footer"><span>© 2026 Cafea în Doi</span><div className="links"><Link href="/declaratii">Declarații</Link><Link href="/blog">Gândurile mele</Link><Link href="/confidentialitate">Confidențialitate</Link><Link href="/contact">Contact</Link></div></div></footer>
 </>;
}
