import Link from "next/link";
import OpinionModeration from "../../../components/OpinionModeration";

export const metadata={title:"Moderare opinii",robots:{index:false,follow:false}};

export default function Page(){
 return <main className="admin-dashboard">
  <aside className="admin-sidebar">
   <Link className="admin-brand" href="/"><span>☕</span><div><strong>Cafea în Doi</strong><small>Administrare</small></div></Link>
   <nav className="admin-nav" aria-label="Administrare">
    <Link className="active" href="/admin/opinii"><span>💬</span>Opinii</Link>
    <Link href="/admin/profil-compatibilitate"><span>♡</span>Compatibilitate</Link>
    <Link href="/blog" target="_blank"><span>↗</span>Vezi site-ul</Link>
   </nav>
   <div className="admin-sidebar-note"><span>Moderare activă</span><small>Doar opiniile aprobate sunt publicate.</small></div>
  </aside>

  <section className="admin-content">
   <header className="admin-topbar">
    <div>
     <div className="eyebrow">Administrare · Gândurile mele</div>
     <h1>Opiniile cititorilor</h1>
     <p>Moderează ce apare public sub articole.</p>
    </div>
    <Link className="admin-view-site" href="/blog" target="_blank">Vezi articolele ↗</Link>
   </header>
   <OpinionModeration/>
  </section>
 </main>;
}
