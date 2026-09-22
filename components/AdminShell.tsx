"use client";
import Link from "next/link";
import {ReactNode,useMemo,useState} from "react";
import {usePathname,useRouter} from "next/navigation";

type Props={title:string;subtitle?:string;eyebrow?:string;children:ReactNode;actions?:ReactNode};

const navGroups=[
 {label:"Principal",items:[
  {href:"/admin",label:"Overview",icon:"⌂"},
  {href:"/admin/opinii",label:"Opinii",icon:"💬"},
  {href:"/admin/invitatii",label:"Invitații",icon:"☕"}
 ]},
 {label:"Conținut",items:[
  {href:"/admin/articole",label:"Articole",icon:"✎"},
  {href:"/admin/compatibilitate",label:"Compatibilitate",icon:"♡"},
  {href:"/admin/contact",label:"Contact",icon:"✉"}
 ]},
 {label:"Administrare",items:[
  {href:"/admin/statistici",label:"Statistici",icon:"▥"},
  {href:"/admin/setari",label:"Setări",icon:"⚙"}
 ]}
];

export default function AdminShell({title,subtitle,eyebrow="Cafea în Doi · Administrare",children,actions}:Props){
 const pathname=usePathname();
 const router=useRouter();
 const [open,setOpen]=useState(false);
 const [search,setSearch]=useState("");
 const flat=useMemo(()=>navGroups.flatMap(g=>g.items),[]);
 const matches=search.trim()?flat.filter(i=>i.label.toLocaleLowerCase("ro").includes(search.trim().toLocaleLowerCase("ro"))):[];

 function active(href:string){return href==="/admin"?pathname==="/admin":pathname===href||pathname.startsWith(href+"/")}
 async function logout(){await fetch("/api/admin/login",{method:"DELETE"});router.replace("/admin/login");router.refresh()}

 return <div className="admin-v2">
  <aside className={"admin-v2-sidebar "+(open?"open":"")}>
   <div className="admin-v2-sidebar-head">
    <Link className="admin-v2-brand" href="/admin" onClick={()=>setOpen(false)}>
     <span className="admin-v2-logo">☕</span><span><strong>Cafea în Doi</strong><small>Administrare</small></span>
    </Link>
    <button className="admin-v2-close" onClick={()=>setOpen(false)} aria-label="Închide meniul">×</button>
   </div>
   <nav className="admin-v2-nav" aria-label="Navigare administrare">
    {navGroups.map(group=><div className="admin-v2-group" key={group.label}>
     <span className="admin-v2-group-label">{group.label}</span>
     {group.items.map(item=><Link key={item.href} className={active(item.href)?"active":""} href={item.href} onClick={()=>setOpen(false)}>
      <span className="admin-v2-nav-icon">{item.icon}</span><span>{item.label}</span>
     </Link>)}
    </div>)}
   </nav>
   <div className="admin-v2-sidebar-footer"><Link href="/" target="_blank">↗ Vezi site-ul</Link><button onClick={logout}>Ieșire</button></div>
  </aside>
  {open&&<button className="admin-v2-backdrop" aria-label="Închide meniul" onClick={()=>setOpen(false)}/>}
  <div className="admin-v2-main">
   <div className="admin-v2-mobilebar"><button onClick={()=>setOpen(true)} aria-label="Deschide meniul">☰</button><Link href="/admin"><strong>Cafea în Doi</strong></Link><Link href="/" target="_blank">↗</Link></div>
   <header className="admin-v2-topbar">
    <div className="admin-v2-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>
    <div className="admin-v2-top-actions">
     <div className="admin-v2-search-wrap"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Caută un modul…" aria-label="Caută un modul"/>
      {matches.length>0&&<div className="admin-v2-search-results">{matches.map(i=><Link key={i.href} href={i.href} onClick={()=>setSearch("")}>{i.icon} {i.label}</Link>)}</div>}
     </div>
     {actions}<Link className="admin-v2-site-btn" href="/" target="_blank">Vezi site-ul ↗</Link>
    </div>
   </header>
   <main className="admin-v2-content">{children}</main>
  </div>
 </div>;
}
