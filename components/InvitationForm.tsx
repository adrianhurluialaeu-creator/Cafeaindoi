"use client";
import Link from "next/link";
import CoffeeBookingPicker from "./CoffeeBookingPicker";
import LiveMediaCapture from "./LiveMediaCapture";
import {FormEvent,useEffect,useRef,useState} from "react";

declare global{interface Window{dataLayer:any[];gtag?:(...args:any[])=>void}}
const CONVERSION_DESTINATION="AW-18467510680/66mnCKWvgYEdEJiz_-VE";
function reportConversion(){window.dataLayer=window.dataLayer||[];if(typeof window.gtag!=="function")window.gtag=function(){window.dataLayer.push(arguments as any)};window.gtag("event","conversion",{send_to:CONVERSION_DESTINATION,value:1,currency:"EUR"})}

export default function InvitationForm(){
 const formRef=useRef<HTMLFormElement>(null),[step,setStep]=useState<1|2|3>(1),[media,setMedia]=useState<File|null>(null);
 const [state,setState]=useState<"idle"|"sending"|"sent"|"error">("idle"),[error,setError]=useState("");
 const [slots,setSlots]=useState<{start:string;label:string}[]>([]),[enabled,setEnabled]=useState(false),[loadingSlots,setLoadingSlots]=useState(true),[selectedSlot,setSelectedSlot]=useState("");
 useEffect(()=>{fetch("/api/program",{cache:"no-store"}).then(async r=>{if(!r.ok)throw Error();return r.json()}).then(x=>{setSlots(x.slots);setEnabled(x.enabled)}).catch(()=>setError("Programul nu poate fi încărcat. Reîncarcă pagina.")).finally(()=>setLoadingSlots(false))},[]);
 function validate(ids:string[]){for(const id of ids){const field=document.getElementById(id) as HTMLInputElement|HTMLTextAreaElement|null;if(field&&!field.reportValidity())return false}return true}
 function nextFromAbout(){if(!validate(["invite-prenume","invite-varsta","invite-localitate","invite-tara","invite-despre"]))return;setError("");setStep(2);requestAnimationFrame(()=>document.getElementById("invite-email")?.focus())}
 function nextFromContact(){if(!validate(["invite-email","invite-whatsapp"]))return;if(enabled&&!selectedSlot){setError("Alege ziua și ora cafelei.");return}setError("");setStep(3)}
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(step===1){nextFromAbout();return}if(step===2){nextFromContact();return}setState("sending");setError("");
  if(!media){setError("Pentru verificarea live, fă un selfie sau un video de maximum 5 secunde.");setState("error");return}
  const form=e.currentTarget,d=new FormData(form);if(enabled)d.set("slotStart",selectedSlot);d.set("photo",media);
  try{const r=await fetch("/api/invitatie",{method:"POST",body:d}),x=await r.json();if(!r.ok)throw new Error(x.error||"Trimiterea a eșuat.");reportConversion();form.reset();setState("sent")}catch(err){setError(err instanceof Error?err.message:"Trimiterea a eșuat.");setState("error")}
 }
 if(state==="sent")return <div className="success" role="status"><b>☕ {enabled?"Am primit propunerea ta pentru o cafea în doi.":"Invitația a fost trimisă."}</b><p>{enabled?"Îți confirm personal ziua și ora dacă putem bea cafeaua împreună.":"Mulțumesc că mi-ai scris. Dacă există interes reciproc, continuăm pe WhatsApp."}</p></div>;
 return <form ref={formRef} onSubmit={submit} encType="multipart/form-data" className="invite-form">
  <div className="invite-steps three" aria-label="Progres formular"><span className={step===1?"active":"done"}><b>{step===1?"1":"✓"}</b> Despre tine</span><i/><span className={step===2?"active":step>2?"done":""}><b>{step>2?"✓":"2"}</b> Contact</span><i/><span className={step===3?"active":""}><b>3</b> Prezentare</span></div>
  <section className={step===1?"invite-step active":"invite-step"} aria-hidden={step!==1}>
   <h3>Mai întâi, câteva lucruri despre tine</h3><p>Doar cât să-mi fac o primă impresie. Durează aproximativ un minut.</p>
   <div className="row"><div><label htmlFor="invite-prenume">Prenume *</label><input id="invite-prenume" name="prenume" autoComplete="given-name" maxLength={80} required tabIndex={step===1?0:-1}/></div><div><label htmlFor="invite-varsta">Vârsta *</label><input id="invite-varsta" name="varsta" type="number" min="18" max="99" required tabIndex={step===1?0:-1}/></div></div>
   <div className="row"><div><label htmlFor="invite-localitate">Localitate *</label><input id="invite-localitate" name="localitate" autoComplete="address-level2" maxLength={120} required tabIndex={step===1?0:-1}/></div><div><label htmlFor="invite-tara">Țară *</label><input id="invite-tara" name="tara" autoComplete="country-name" defaultValue="România" maxLength={80} required tabIndex={step===1?0:-1}/></div></div>
   <label htmlFor="invite-despre">Spune-mi puțin despre tine *</label><textarea id="invite-despre" name="despre" maxLength={3000} placeholder="Ce îți place, cum îți petreci timpul și ce cauți într-o relație…" required tabIndex={step===1?0:-1}/>
   <button type="button" className="btn invite-next" onClick={nextFromAbout}>Continuă →</button>
  </section>
  <section className={step===2?"invite-step active":"invite-step"} aria-hidden={step!==2}>
   <h3>Contact și cafea</h3><p>Datele rămân private și sunt folosite numai pentru această invitație.</p>
   <label htmlFor="invite-email">Email *</label><input id="invite-email" name="email" type="email" autoComplete="email" maxLength={254} required tabIndex={step===2?0:-1}/>
   <label htmlFor="invite-whatsapp">Număr WhatsApp *</label><input id="invite-whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="+40 7xx xxx xxx" pattern="^[+0-9][0-9 ()-]{6,24}$" maxLength={25} required tabIndex={step===2?0:-1}/>
   <div className="coffee-slots">{loadingSlots?<p>Se încarcă programul…</p>:enabled?slots.length?<CoffeeBookingPicker slots={slots} value={selectedSlot} onChange={setSelectedSlot}/>:<p>Nu există intervale libere în următoarele 14 zile.</p>:<p>Programările nu sunt deschise momentan. Poți trimite o invitație fără oră propusă.</p>}</div>
   {error&&<div className="formerror" role="alert">{error}</div>}
   <div className="invite-actions"><button type="button" className="btn alt" onClick={()=>setStep(1)}>← Înapoi</button><button type="button" className="btn" disabled={loadingSlots||enabled&&!slots.length} onClick={nextFromContact}>Continuă →</button></div>
  </section>
  <section className={step===3?"invite-step active":"invite-step"} aria-hidden={step!==3}>
   <h3>Verificare live</h3><p>Ultimul pas. Fă un selfie sau un video mut de maximum 5 secunde pentru a confirma că invitația este reală.</p>
   <LiveMediaCapture onChange={setMedia}/>
   <div aria-hidden="true" style={{position:"absolute",left:"-10000px",width:1,height:1,overflow:"hidden"}}><label htmlFor="invite-website">Website</label><input id="invite-website" name="website" tabIndex={-1} autoComplete="off"/></div>
   <label className="check"><input name="ageOk" type="checkbox" required tabIndex={step===3?0:-1}/>Confirm că am cel puțin 18 ani.</label>
   <label className="check"><input name="whatsappOptIn" type="checkbox" tabIndex={step===3?0:-1}/>Doresc să primesc confirmarea întâlnirii și pe WhatsApp la numărul introdus.</label>
   <label className="check"><input name="privacyOk" type="checkbox" required tabIndex={step===3?0:-1}/>Sunt de acord cu prelucrarea datelor și a selfie-ului sau videoului de verificare live, conform <Link href="/confidentialitate">Politicii de confidențialitate</Link>.</label>
   {state==="error"&&<div className="formerror" role="alert">{error}</div>}
   <div className="invite-actions"><button type="button" className="btn alt" onClick={()=>setStep(2)}>← Înapoi</button><button disabled={state==="sending"||!media} className="btn">{state==="sending"?"Se trimite…":enabled?"☕ Propune cafeaua":"☕ Trimite invitația"}</button></div>
  </section>
 </form>
}
