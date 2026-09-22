"use client";
import Link from "next/link";
import {FormEvent,useState} from "react";
declare global{interface Window{gtag?:(...args:any[])=>void}}
const MAX_PHOTO=5*1024*1024;
const PHOTO_TYPES=["image/jpeg","image/png","image/webp"];
export default function InvitationForm(){
 const [state,setState]=useState<"idle"|"sending"|"sent"|"error">("idle"),[error,setError]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setState("sending");setError("");
  const form=e.currentTarget,d=new FormData(form),photo=d.get("photo");
  if(!(photo instanceof File)||photo.size===0){setError("Fotografia este obligatorie.");setState("error");return}
  if(!PHOTO_TYPES.includes(photo.type)){setError("Fotografia trebuie să fie JPG, PNG sau WebP.");setState("error");return}
  if(photo.size>MAX_PHOTO){setError("Fotografia poate avea maximum 5 MB.");setState("error");return}
  try{const r=await fetch("/api/invitatie",{method:"POST",body:d});const x=await r.json();if(!r.ok)throw new Error(x.error||"Trimiterea a eșuat.");setState("sent");window.gtag?.("event","generate_lead",{send_to:"AW-18467510680"});form.reset()}catch(err){setError(err instanceof Error?err.message:"Trimiterea a eșuat.");setState("error")}
 }
 if(state==="sent")return <div className="success"><b>☕ Invitația a fost trimisă.</b><p>Mulțumesc că mi-ai scris. Dacă există interes reciproc, continuăm pe WhatsApp.</p></div>;
 return <form onSubmit={submit} encType="multipart/form-data"><div className="row"><div><label>Prenume *</label><input name="prenume" autoComplete="given-name" maxLength={80} required/></div><div><label>Vârsta *</label><input name="varsta" type="number" min="18" max="99" required/></div></div><div className="row"><div><label>Localitate *</label><input name="localitate" maxLength={120} required/></div><div><label>Țară *</label><input name="tara" defaultValue="România" maxLength={80} required/></div></div><label>Spune-mi puțin despre tine *</label><textarea name="despre" maxLength={3000} required/><label>Număr WhatsApp *</label><input name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="+40 7xx xxx xxx" pattern="^[+0-9][0-9 ()-]{6,24}$" maxLength={25} required/><label>Fotografie recentă *</label><input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required/><small>JPG, PNG sau WebP · maximum 5 MB. Fotografia este trimisă numai împreună cu invitația.</small><div aria-hidden="true" style={{position:"absolute",left:"-10000px",width:1,height:1,overflow:"hidden"}}><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div><label className="check"><input name="ageOk" type="checkbox" required/>Confirm că am cel puțin 18 ani.</label><label className="check"><input name="privacyOk" type="checkbox" required/>Sunt de acord cu prelucrarea datelor, inclusiv a fotografiei încărcate, pentru gestionarea acestei invitații, conform <Link href="/confidentialitate">Politicii de confidențialitate</Link>.</label>{state==="error"&&<div className="formerror" role="alert">{error}</div>}<button disabled={state==="sending"} className="btn" style={{width:"100%"}}>{state==="sending"?"Se trimite…":"☕ Trimite invitația"}</button></form>
}