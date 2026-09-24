"use client";
import {FormEvent,useState} from "react";

export default function ContactForm({successMessage}:{successMessage:string}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[sent,setSent]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");const form=event.currentTarget,data=new FormData(form),payload={name:data.get("name"),email:data.get("email"),subject:data.get("subject"),message:data.get("message"),website:data.get("website"),consent:data.get("consent")==="on"};try{const response=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}),value=await response.json();if(!response.ok)throw Error(value.error||"Mesajul nu a putut fi trimis.");form.reset();setSent(true)}catch(reason){setError(reason instanceof Error?reason.message:"Mesajul nu a putut fi trimis.")}finally{setBusy(false)}}
 if(sent)return <div className="contact-success" role="status"><span>✓</span><h2>Mesaj trimis</h2><p>{successMessage}</p><button type="button" onClick={()=>setSent(false)}>Trimite alt mesaj</button></div>;
 return <form className="contact-form" onSubmit={submit}>
  <div className="contact-form-row"><label>Nume<input name="name" required minLength={2} maxLength={80} autoComplete="name"/></label><label>Email<input name="email" type="email" required maxLength={254} autoComplete="email"/></label></div>
  <label>Subiect<input name="subject" required minLength={2} maxLength={140}/></label>
  <label>Mesaj<textarea name="message" required minLength={10} maxLength={5000} rows={7}/></label>
  <label className="contact-honeypot" aria-hidden="true">Site web<input name="website" tabIndex={-1} autoComplete="off"/></label>
  <label className="check contact-consent"><input name="consent" type="checkbox" required/><span>Sunt de acord ca datele introduse să fie folosite pentru a primi un răspuns la acest mesaj. Am citit <a href="/confidentialitate" target="_blank">politica de confidențialitate</a>.</span></label>
  {error?<p className="formerror" role="alert">{error}</p>:null}<button className="btn" disabled={busy} type="submit">{busy?"Se trimite…":"Trimite mesajul"}</button>
 </form>
}
