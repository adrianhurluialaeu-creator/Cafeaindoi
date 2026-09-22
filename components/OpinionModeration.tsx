"use client";
import {useEffect,useMemo,useState} from "react";

type Opinion={id:string;article:string;articleTitle:string;prenume:string;opinia:string;createdAt:string;approvedAt?:string};
type Data={pending:Opinion[];approved:Opinion[]};
type Tab="pending"|"approved";

export default function OpinionModeration(){
 const [data,setData]=useState<Data>({pending:[],approved:[]});
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [tab,setTab]=useState<Tab>("pending");
 const [query,setQuery]=useState("");

 async function load(){
  setLoading(true);setError("");
  const r=await fetch("/api/admin/opinii",{cache:"no-store"});
  const x=await r.json();
  if(!r.ok){setError(x.error||"Nu s-au putut încărca opiniile.");setLoading(false);return}
  setData(x);setLoading(false);
 }
 useEffect(()=>{load()},[]);

 async function act(id:string,action:"approve"|"reject"|"delete"|"unpublish"){
  if((action==="reject"||action==="delete")&&!confirm("Sigur vrei să ștergi această opinie?"))return;
  const r=await fetch("/api/admin/opinii",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id,action})});
  const x=await r.json();
  if(!r.ok){alert(x.error||"Operațiunea nu a reușit.");return}
  await load();
 }

 const active=tab==="pending"?data.pending:data.approved;
 const filtered=useMemo(()=>{
  const q=query.trim().toLocaleLowerCase("ro");
  if(!q)return active;
  return active.filter(o=>[o.prenume,o.opinia,o.articleTitle,o.article].join(" ").toLocaleLowerCase("ro").includes(q));
 },[active,query]);

 const Card=({o,pending}:{o:Opinion;pending:boolean})=><article className="admin-opinion-card">
  <div className="admin-opinion-card-top">
   <div className="admin-opinion-person">
    <span className="admin-avatar">{o.prenume.slice(0,1).toUpperCase()}</span>
    <div><strong>{o.prenume}</strong><small>{new Date(o.createdAt).toLocaleString("ro-RO")}</small></div>
   </div>
   <span className={"admin-status "+(pending?"pending":"published")}>{pending?"În așteptare":"Publicată"}</span>
  </div>

  <blockquote>{o.opinia}</blockquote>

  <div className="admin-opinion-article">
   <span>Articol</span>
   <a href={o.article} target="_blank" rel="noreferrer">{o.articleTitle||o.article} ↗</a>
  </div>

  <div className="admin-opinion-actions">
   {pending?<>
    <button className="admin-action primary" onClick={()=>act(o.id,"approve")}>✓ Aprobă și publică</button>
    <button className="admin-action danger" onClick={()=>act(o.id,"reject")}>Respinge</button>
   </>:<>
    <button className="admin-action secondary" onClick={()=>act(o.id,"unpublish")}>Retrage din public</button>
    <button className="admin-action danger" onClick={()=>act(o.id,"delete")}>Șterge</button>
   </>}
  </div>
 </article>;

 return <div className="admin-moderation">
  <div className="admin-stat-grid">
   <button className={"admin-stat "+(tab==="pending"?"active":"")} onClick={()=>setTab("pending")}>
    <span className="admin-stat-icon">◷</span><div><strong>{data.pending.length}</strong><small>În așteptare</small></div>
   </button>
   <button className={"admin-stat "+(tab==="approved"?"active":"")} onClick={()=>setTab("approved")}>
    <span className="admin-stat-icon">✓</span><div><strong>{data.approved.length}</strong><small>Publicate</small></div>
   </button>
   <div className="admin-stat">
    <span className="admin-stat-icon">Σ</span><div><strong>{data.pending.length+data.approved.length}</strong><small>Total opinii</small></div>
   </div>
  </div>

  <div className="admin-panel">
   <div className="admin-panel-head">
    <div>
     <h2>{tab==="pending"?"Opinii în așteptare":"Opinii publicate"}</h2>
     <p>{tab==="pending"?"Verifică fiecare opinie înainte să apară pe site.":"Opiniile vizibile public sub articole."}</p>
    </div>
    <button className="admin-refresh" onClick={load} disabled={loading}>↻ Reîncarcă</button>
   </div>

   <div className="admin-toolbar">
    <div className="admin-tabs">
     <button className={tab==="pending"?"active":""} onClick={()=>setTab("pending")}>În așteptare <span>{data.pending.length}</span></button>
     <button className={tab==="approved"?"active":""} onClick={()=>setTab("approved")}>Publicate <span>{data.approved.length}</span></button>
    </div>
    <label className="admin-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Caută după prenume, articol sau text…"/></label>
   </div>

   {error&&<div className="formerror">{error}</div>}
   {loading?<div className="admin-empty"><div className="admin-empty-icon">…</div><strong>Se încarcă opiniile</strong></div>:
    filtered.length?<div className="admin-opinion-list">{filtered.map(o=><Card key={o.id} o={o} pending={tab==="pending"}/>)}</div>:
    <div className="admin-empty">
     <div className="admin-empty-icon">{query?"⌕":tab==="pending"?"✓":"○"}</div>
     <strong>{query?"Nu am găsit rezultate":tab==="pending"?"Totul este moderat":"Nu există opinii publicate"}</strong>
     <p>{query?"Încearcă alt termen de căutare.":tab==="pending"?"Nu ai nicio opinie care așteaptă aprobarea.":"Opiniile aprobate vor apărea aici."}</p>
    </div>}
  </div>
 </div>;
}
