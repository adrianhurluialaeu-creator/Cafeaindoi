"use client";
import Link from "next/link";
import {FormEvent,useEffect,useState} from "react";

type PublicOpinion={id:string;prenume:string;opinia:string;createdAt:string;approvedAt?:string};

function visitorId(){
 const key="cafeaindoi-like-id";
 let id=localStorage.getItem(key);
 if(!id){id=(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36));localStorage.setItem(key,id)}
 return id;
}

export default function DeclarationInteractions({slug,title,initialLikes}:{slug:string;title:string;initialLikes:number}){
 const path="/declaratii/"+slug;
 const [likes,setLikes]=useState(initialLikes);
 const [liked,setLiked]=useState(false);
 const [opinions,setOpinions]=useState<PublicOpinion[]>([]);
 const [state,setState]=useState<"idle"|"sending"|"sent"|"error">("idle");
 const [error,setError]=useState("");

 useEffect(()=>{try{setLiked(localStorage.getItem("cafeaindoi-liked-"+slug)==="1")}catch{}},[slug]);
 useEffect(()=>{fetch("/api/opinie?article="+encodeURIComponent(path),{cache:"no-store"}).then(r=>r.json()).then(x=>{if(Array.isArray(x.opinions))setOpinions(x.opinions)}).catch(()=>{})},[path]);

 async function toggleLike(){
  try{
   const next=!liked;
   const r=await fetch("/api/declaratii",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({slug,visitorId:visitorId(),liked:next})});
   const x=await r.json();if(!r.ok)throw new Error();
   setLiked(next);setLikes(x.likes);localStorage.setItem("cafeaindoi-liked-"+slug,next?"1":"0");
  }catch{alert("Aprecierea nu a putut fi salvată.")}
 }

 async function shareNative(){
  const url=location.href;
  if(navigator.share){try{await navigator.share({title,text:title,url});return}catch{}}
  await navigator.clipboard.writeText(url);alert("Link copiat.");
 }

 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setState("sending");setError("");
  const form=e.currentTarget,fd=new FormData(form);fd.set("article",path);fd.set("articleTitle",title);
  try{
   const r=await fetch("/api/opinie",{method:"POST",body:fd});const x=await r.json();
   if(!r.ok)throw new Error(x.error||"Opinia nu a putut fi trimisă.");
   form.reset();setState("sent");
  }catch(err){setError(err instanceof Error?err.message:"Opinia nu a putut fi trimisă.");setState("error")}
 }

 const absolute="https://www.cafeaindoi.eu/declaratii/"+slug;
 return <>
  <section className="declaration-actions-bar">
   <button className={"declaration-like "+(liked?"liked":"")} onClick={toggleLike}>{liked?"♥":"♡"} <strong>{likes}</strong> <span>{liked?"Îți place":"Îmi place"}</span></button>
   <button onClick={shareNative}>↗ Distribuie</button>
   <a href={"https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(absolute)} target="_blank" rel="noreferrer">Facebook</a>
  </section>

  <section className="article-opinion declaration-opinion" aria-labelledby="decl-opinion-title">
   <div className="eyebrow">Opinia ta</div><h2 id="decl-opinion-title">Ce părere ai?</h2><p>Scrie propria opinie despre această declarație.</p>
   {state==="sent"?<div className="success"><b>Mulțumesc. Opinia ta a fost trimisă spre moderare.</b></div>:<form onSubmit={submit}>
    <label htmlFor="decl-op-prenume">Prenume *</label><input id="decl-op-prenume" name="prenume" maxLength={80} required/>
    <label htmlFor="decl-op-opinia">Opinia ta *</label><textarea id="decl-op-opinia" name="opinia" minLength={3} maxLength={3000} required/>
    <div aria-hidden="true" className="opinion-hp"><label>Website<input name="website" tabIndex={-1}/></label></div>
    <label className="check"><input name="publishOk" type="checkbox" required/>Sunt de acord cu moderarea și publicarea opiniei mele conform <Link href="/confidentialitate">Politicii de confidențialitate</Link>.</label>
    {state==="error"&&<div className="formerror">{error}</div>}
    <button className="btn" disabled={state==="sending"}>{state==="sending"?"Se trimite…":"Trimite opinia"}</button>
   </form>}
  </section>

  <section className="reader-opinions">
   <h2>Opiniile cititorilor</h2>
   {opinions.length===0?<p className="reader-opinions-empty">Nu există încă opinii publicate.</p>:opinions.map(o=><article className="reader-opinion" key={o.id}><div><strong>{o.prenume}</strong><time>{new Date(o.approvedAt||o.createdAt).toLocaleDateString("ro-RO")}</time></div><p>{o.opinia}</p></article>)}
  </section>
 </>;
}
