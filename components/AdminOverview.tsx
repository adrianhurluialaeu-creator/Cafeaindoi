"use client";
import Link from "next/link";
import {useEffect,useState} from "react";

export default function AdminOverview(){
 const [counts,setCounts]=useState({pending:0,approved:0});
 useEffect(()=>{fetch("/api/admin/opinii",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(x=>{if(x)setCounts({pending:x.pending?.length||0,approved:x.approved?.length||0})}).catch(()=>{})},[]);
 const modules=[
  {href:"/admin/opinii",icon:"💬",title:"Opinii",desc:"Moderare și publicare opinii",meta:counts.pending?counts.pending+" de aprobat":"Nimic în așteptare"},
  {href:"/admin/invitatii",icon:"☕",title:"Invitații",desc:"Gestionează invitațiile primite",meta:"Modul pregătit"},
  {href:"/admin/articole",icon:"✎",title:"Articole",desc:"Administrarea Gândurilor mele",meta:"Modul pregătit"},
  {href:"/admin/compatibilitate",icon:"♡",title:"Compatibilitate",desc:"Profilul de referință al testului",meta:"Configurare"},
  {href:"/admin/contact",icon:"✉",title:"Contact",desc:"Mesaje și solicitări",meta:"Modul pregătit"},
  {href:"/admin/statistici",icon:"▥",title:"Statistici",desc:"Trafic, conversii și activitate",meta:"Modul pregătit"},
  {href:"/admin/setari",icon:"⚙",title:"Setări",desc:"Configurarea site-ului și modulelor",meta:"Modul pregătit"}
 ];
 return <>
  <section className="admin-v2-kpis">
   <Link href="/admin/opinii"><span>Opinii în așteptare</span><strong>{counts.pending}</strong><small>Necesită moderare</small></Link>
   <Link href="/admin/opinii"><span>Opinii publicate</span><strong>{counts.approved}</strong><small>Vizibile pe site</small></Link>
   <Link href="/admin/articole"><span>Conținut</span><strong>Gândurile mele</strong><small>Administrare articole</small></Link>
   <Link href="/admin/invitatii"><span>Relații</span><strong>Invitații</strong><small>Flux separat</small></Link>
  </section>
  <section className="admin-v2-section">
   <div className="admin-v2-section-title"><div><h2>Module</h2><p>Fiecare zonă este separată și poate fi extinsă independent.</p></div></div>
   <div className="admin-v2-module-grid">
    {modules.map(m=><Link className="admin-v2-module-card" href={m.href} key={m.href}><span className="admin-v2-module-icon">{m.icon}</span><div><h3>{m.title}</h3><p>{m.desc}</p><small>{m.meta}</small></div><b>›</b></Link>)}
   </div>
  </section>
 </>;
}
