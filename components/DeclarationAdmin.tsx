"use client";
import {FormEvent,useEffect,useMemo,useState} from "react";

type Declaration={
 id:string;slug:string;title:string;text:string;category:string;imageUrl?:string;
 createdAt:string;updatedAt:string;publishedAt?:string;status:"draft"|"published";
};
type Data={drafts:Declaration[];published:Declaration[]};
type Tab="drafts"|"published";

const categories=["Dragoste","Dor","Pentru ea","Gânduri de seară","Împăcare","Promisiuni","Aniversare"];

export default function DeclarationAdmin(){
 const [data,setData]=useState<Data>({drafts:[],published:[]});
 const [tab,setTab]=useState<Tab>("drafts");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [editing,setEditing]=useState<Declaration|null>(null);
 const [query,setQuery]=useState("");

 async function load(){
  setLoading(true);setError("");
  const r=await fetch("/api/admin/declaratii",{cache:"no-store"});
  const x=await r.json();
  if(!r.ok){setError(x.error||"Nu s-au putut încărca declarațiile.");setLoading(false);return}
  setData(x);setLoading(false);
 }
 useEffect(()=>{load()},[]);

 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  const fd=new FormData(e.currentTarget);
  const body={title:String(fd.get("title")||""),text:String(fd.get("text")||""),category:String(fd.get("category")||"Dragoste"),imageUrl:String(fd.get("imageUrl")||"")};
  const r=await fetch("/api/admin/declaratii",editing?{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({...body,id:editing.id,action:"update"})}:{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
  const x=await r.json();
  if(!r.ok){alert(x.error||"Salvarea nu a reușit.");return}
  setEditing(null);e.currentTarget.reset();await load();
 }

 async function action(id:string,action:"publish"|"unpublish"){
  const r=await fetch("/api/admin/declaratii",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id,action})});
  const x=await r.json();if(!r.ok){alert(x.error||"Operațiunea nu a reușit.");return}await load();
 }
 async function remove(id:string){
  if(!confirm("Sigur vrei să ștergi această declarație?"))return;
  const r=await fetch("/api/admin/declaratii?id="+encodeURIComponent(id),{method:"DELETE"});
  const x=await r.json();if(!r.ok){alert(x.error||"Ștergerea nu a reușit.");return}if(editing?.id===id)setEditing(null);await load();
 }

 const active=tab==="drafts"?data.drafts:data.published;
 const filtered=useMemo(()=>{
  const q=query.trim().toLocaleLowerCase("ro");if(!q)return active;
  return active.filter(x=>[x.title,x.text,x.category].join(" ").toLocaleLowerCase("ro").includes(q));
 },[active,query]);

 return <div className="declaration-admin">
  <section className="declaration-editor admin-v2-card">
   <div className="declaration-editor-head">
    <div><span className="eyebrow">{editing?"Editare":"Declarație nouă"}</span><h2>{editing?"Modifică declarația":"Scrie o declarație de dragoste"}</h2></div>
    {editing&&<button className="admin-refresh" type="button" onClick={()=>setEditing(null)}>Renunță</button>}
   </div>
   <form onSubmit={submit}>
    <div className="row">
     <div><label htmlFor="decl-title">Titlu *</label><input key={editing?.id+"t"} id="decl-title" name="title" defaultValue={editing?.title||""} maxLength={180} required/></div>
     <div><label htmlFor="decl-cat">Categorie</label><select key={editing?.id+"c"} id="decl-cat" name="category" defaultValue={editing?.category||"Dragoste"}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
    </div>
    <label htmlFor="decl-text">Declarația *</label>
    <textarea key={editing?.id+"x"} id="decl-text" name="text" className="declaration-textarea" defaultValue={editing?.text||""} maxLength={12000} required/>
    <label htmlFor="decl-image">Imagine opțională — URL HTTPS</label>
    <input key={editing?.id+"i"} id="decl-image" name="imageUrl" type="url" placeholder="https://..." defaultValue={editing?.imageUrl||""}/>
    <div className="declaration-editor-actions"><button className="btn" type="submit">{editing?"Salvează modificările":"Salvează ca ciornă"}</button></div>
   </form>
  </section>

  <section className="admin-panel declaration-list-panel">
   <div className="admin-toolbar">
    <div className="admin-tabs">
     <button className={tab==="drafts"?"active":""} onClick={()=>setTab("drafts")}>Ciorne <span>{data.drafts.length}</span></button>
     <button className={tab==="published"?"active":""} onClick={()=>setTab("published")}>Publicate <span>{data.published.length}</span></button>
    </div>
    <label className="admin-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Caută declarații…"/></label>
   </div>

   {error&&<div className="formerror">{error}</div>}
   {loading?<div className="admin-empty"><strong>Se încarcă…</strong></div>:filtered.length?
    <div className="declaration-admin-list">{filtered.map(d=><article className="declaration-admin-item" key={d.id}>
     <div className="declaration-admin-main">
      <div className="declaration-admin-meta"><span>{d.category}</span><small>{new Date(d.updatedAt).toLocaleDateString("ro-RO")}</small></div>
      <h3>{d.title}</h3>
      <p>{d.text.length>240?d.text.slice(0,240)+"…":d.text}</p>
      <div className="declaration-admin-actions">
       <button className="admin-action secondary" onClick={()=>setEditing(d)}>Editează</button>
       {d.status==="draft"?<button className="admin-action primary" onClick={()=>action(d.id,"publish")}>Publică</button>:<>
        <a className="admin-action secondary" href={"/declaratii/"+d.slug} target="_blank" rel="noreferrer">Vezi ↗</a>
        <button className="admin-action secondary" onClick={()=>action(d.id,"unpublish")}>Retrage</button>
       </>}
       <button className="admin-action danger" onClick={()=>remove(d.id)}>Șterge</button>
      </div>
     </div>
     {d.imageUrl&&<img src={d.imageUrl} alt="" className="declaration-admin-thumb"/>}
    </article>)}</div>:
    <div className="admin-empty"><strong>{query?"Nu am găsit rezultate":tab==="drafts"?"Nu ai ciorne":"Nu ai declarații publicate"}</strong></div>}
  </section>
 </div>;
}
