"use client";
import Link from "next/link";
import {FormEvent,useEffect,useState} from "react";
import {createPortal} from "react-dom";
import {usePathname} from "next/navigation";

type SubmitState="idle"|"sending"|"sent"|"error";

export default function ArticleOpinion(){
 const pathname=usePathname();
 const [target,setTarget]=useState<Element|null>(null);
 const [state,setState]=useState<SubmitState>("idle");
 const [error,setError]=useState("");

 useEffect(()=>{
  const article=document.querySelector("article.article-page");
  if(!article)return;
  const slot=document.createElement("div");
  slot.className="article-opinion-slot";
  const related=article.querySelector(".related");
  article.insertBefore(slot,related||null);
  setTarget(slot);
  return()=>{slot.remove();setTarget(null)};
 },[pathname]);

 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  setState("sending");
  setError("");
  const form=e.currentTarget;
  const data=new FormData(form);
  data.set("article",pathname);
  data.set("articleTitle",document.querySelector("article.article-page h1")?.textContent?.trim()||document.title);
  try{
   const r=await fetch("/api/opinie",{method:"POST",body:data});
   const x=await r.json();
   if(!r.ok)throw new Error(x.error||"Opinia nu a putut fi trimisă.");
   form.reset();
   setState("sent");
  }catch(err){
   setError(err instanceof Error?err.message:"Opinia nu a putut fi trimisă.");
   setState("error");
  }
 }

 if(!target)return null;

 return createPortal(
  <section className="article-opinion" aria-labelledby="opinion-title">
   <div className="eyebrow">Opinia ta</div>
   <h2 id="opinion-title">Ce părere ai?</h2>
   <p>Scrie propria opinie despre acest subiect.</p>
   {state==="sent"?(
    <div className="success" role="status">
     <b>Mulțumesc. Opinia ta a fost trimisă spre moderare.</b>
     <p>Dacă este aprobată, o voi publica sub articol.</p>
    </div>
   ):(
    <form onSubmit={submit}>
     <label htmlFor="op-prenume">Prenume *</label>
     <input id="op-prenume" name="prenume" maxLength={80} autoComplete="given-name" required/>
     <label htmlFor="op-opinia">Opinia ta *</label>
     <textarea id="op-opinia" name="opinia" minLength={3} maxLength={3000} required/>
     <div aria-hidden="true" className="opinion-hp">
      <label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
     </div>
     <label className="check">
      <input name="publishOk" type="checkbox" required/>
      Sunt de acord ca prenumele și opinia mea să fie folosite pentru moderare și, dacă sunt aprobate, publicate pe Cafea în Doi, conform <Link href="/confidentialitate">Politicii de confidențialitate</Link>.
     </label>
     {state==="error"&&<div className="formerror" role="alert">{error}</div>}
     <button className="btn" disabled={state==="sending"}>{state==="sending"?"Se trimite…":"Trimite opinia"}</button>
    </form>
   )}
  </section>,
  target
 );
}
