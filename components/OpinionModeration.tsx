"use client";
import {useEffect,useState} from "react";

type Opinion={id:string;article:string;articleTitle:string;prenume:string;opinia:string;createdAt:string;approvedAt?:string};
type Data={pending:Opinion[];approved:Opinion[]};

export default function OpinionModeration(){
 const [data,setData]=useState<Data>({pending:[],approved:[]});
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

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

 const Card=({o,pending}:{o:Opinion;pending:boolean})=><article className="moderation-card">
  <div className="moderation-head">
   <div><strong>{o.prenume}</strong><small>{new Date(o.approvedAt||o.createdAt).toLocaleString("ro-RO")}</small></div>
   <a href={o.article} target="_blank" rel="noreferrer">{o.articleTitle||o.article}</a>
  </div>
  <p>{o.opinia}</p>
  <div className="moderation-actions">
   {pending?<><button className="btn" onClick={()=>act(o.id,"approve")}>Aprobă și publică</button><button className="btn alt" onClick={()=>act(o.id,"reject")}>Respinge</button></>:<><button className="btn alt" onClick={()=>act(o.id,"unpublish")}>Retrage din public</button><button className="btn alt" onClick={()=>act(o.id,"delete")}>Șterge</button></>}
  </div>
 </article>;

 return <div className="moderation">
  <div className="moderation-summary"><span><strong>{data.pending.length}</strong> în așteptare</span><span><strong>{data.approved.length}</strong> publicate</span><button className="btn alt" onClick={load}>Reîncarcă</button></div>
  {error&&<div className="formerror">{error}</div>}
  {loading?<p>Se încarcă…</p>:<>
   <section><h2>În așteptare</h2>{data.pending.length?data.pending.map(o=><Card key={o.id} o={o} pending/>):<p>Nu există opinii în așteptare.</p>}</section>
   <section><h2>Publicate</h2>{data.approved.length?data.approved.map(o=><Card key={o.id} o={o} pending={false}/>):<p>Nu există opinii publicate.</p>}</section>
  </>}
 </div>;
}
