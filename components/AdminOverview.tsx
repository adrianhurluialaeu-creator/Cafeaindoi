"use client";
import Link from "next/link";
import {useEffect,useState} from "react";

export default function AdminOverview(){
 const [counts,setCounts]=useState({pending:0,approved:0,drafts:0,declarations:0,invitations:0});
 useEffect(()=>{Promise.all([fetch("/api/admin/opinii",{cache:"no-store"}).then(r=>r.ok?r.json():null),fetch("/api/admin/declaratii",{cache:"no-store"}).then(r=>r.ok?r.json():null),fetch("/api/admin/invitatii",{cache:"no-store"}).then(r=>r.ok?r.json():null)]).then(([o,d,i])=>setCounts({pending:o?.pending?.length||0,approved:o?.approved?.length||0,drafts:d?.drafts?.length||0,declarations:d?.published?.length||0,invitations:i?.invitations?.length||0})).catch(()=>{})},[]);
 const modules=[
  {href:"/admin/opinii",icon:"💬",title:"Opinii",desc:"Moderare și publicare opinii",meta:counts.pending?counts.pending+" de aprobat":"Nimic în așteptare"},
  {href:"/admin/invitatii",icon:"☕",title:"Invitații",desc:"Gestionează invitațiile primite",meta:counts.invitations+" primite"},
  {href:"/admin/articole",icon:"✎",title:"Articole",desc:"Administrarea Gândurilor mele",meta:"Modul pregătit"},
  {href:"/admin/declaratii",icon:"💌",title:"Declarații",desc:"Scrie și publică declarații de dragoste",meta:counts.drafts?counts.drafts+" ciorne":counts.declarations+" publicate"},
  {href:"/admin/compatibilitate",icon:"♡",title:"Compatibilitate",desc:"Profilul de referință al testului",meta:"Configurare"},
  {href:"/admin/contact",icon:"✉",title:"Contact",desc:"Mesaje și solicitări",meta:"Modul pregătit"},
  {href:"/admin/statistici",icon:"▥",title:"Statistici",desc:"Trafic, conversii și activitate",meta:"Dashboard activ"},
  {href:"/admin/setari",icon:"⚙",title:"Setări",desc:"Configurarea site-ului și modulelor",meta:"Modul pregătit"}
 ];
 return <>
  <section className="admin-v2-kpis">
   <Link href="/admin/opinii"><span>Opinii în așteptare</span><strong>{counts.pending}</strong><small>Necesită moderare</small></Link>
   <Link href="/admin/opinii"><span>Opinii publicate</span><strong>{counts.approved}</strong><small>Vizibile pe site</small></Link>
   <Link href="/admin/declaratii"><span>Declarații</span><strong>{counts.declarations}</strong><small>{counts.drafts?counts.drafts+" ciorne":"Publicate pe site"}</small></Link>
   <Link href="/admin/invitatii"><span>Relații</span><strong>{counts.invitations}</strong><small>Primite în dashboard</small></Link>
  </section>
  <section className="admin-v2-section">
   <div className="admin-v2-section-title"><div><h2>Module</h2><p>Fiecare zonă este separată și poate fi extinsă independent.</p></div></div>
   <div className="admin-v2-module-grid">
    {modules.map(m=><Link className="admin-v2-module-card" href={m.href} key={m.href}><span className="admin-v2-module-icon">{m.icon}</span><div><h3>{m.title}</h3><p>{m.desc}</p><small>{m.meta}</small></div><b>›</b></Link>)}
   </div>
  </section>
 </>;
}
