"use client";
import Link from "next/link";
import CoffeeBookingPicker from "./CoffeeBookingPicker";
import {FormEvent,useEffect,useRef,useState} from "react";

declare global{interface Window{dataLayer:any[];gtag?:(...args:any[])=>void}}
const MAX_PHOTO=5*1024*1024,PHOTO_TYPES=["image/jpeg","image/png","image/webp"],CONVERSION_DESTINATION="AW-18467510680/66mnCKWvgYEdEJiz_-VE";
function reportConversion(){window.dataLayer=window.dataLayer||[];if(typeof window.gtag!=="function")window.gtag=function(){window.dataLayer.push(arguments as any)};window.gtag("event","conversion",{send_to:CONVERSION_DESTINATION,value:1,currency:"EUR"})}

export default function InvitationForm(){
 const formRef=useRef<HTMLFormElement>(null),[step,setStep]=useState<1|2>(1);
 const [state,setState]=useState<"idle"|"sending"|"sent"|"error">("idle"),[error,setError]=useState("");
 const [slots,setSlots]=useState<{start:string;label:string}[]>([]),[enabled,setEnabled]=useState(false),[loadingSlots,setLoadingSlots]=useState(true),[selectedSlot,setSelectedSlot]=useState("");
 useEffect(()=>{fetch("/api/program",{cache:"no-store"}).then(async r=>{if(!r.ok)throw Error();return r.json()}).then(x=>{setSlots(x.slots);setEnabled(x.enabled)}).catch(()=>setError("Programul nu poate fi încărcat. Reîncarcă pagina.")).finally(()=>setLoadingSlots(false))},[]);
 function next(){const ids=["invite-prenume","invite-varsta","invite-localitate","invite-tara","invite-despre"];for(const id of ids){const field=document.getElementById(id) as HTMLInputElement|HTMLTextAreaElement|null;if(field&&!field.reportValidity())return}setError("");setStep(2);requestAnimationFrame(()=>document.getElementById("invite-email")?.focus())}
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(step===1){next();return}setState("sending");setError("");
  const form=e.currentTarget,d=new FormData(form),photo=d.get("photo");
  if(enabled&&!selectedSlot){setError("Alege ziua și ora cafelei.");setState("error");return}if(enabled)d.set("slotStart",selectedSlot);
  if(photo instanceof File&&photo.size>0){if(!PHOTO_TYPES.includes(photo.type)){setError("Fotografia trebuie să fie JPG, PNG sau WebP.");setState("error");return}if(photo.size>MAX_PHOTO){setError("Fotografia poate avea maximum 5 MB.");setState("error");return}}
  try{const r=await fetch("/api/invitatie",{method:"POST",body:d}),x=await r.json();if(!r.ok)throw new Error(x.error||"Trimiterea a eșuat.");reportConversion();form.reset();setState("sent")}catch(err){setError(err instanceof Error?err.message:"Trimiterea a eșuat.");setState("error")}
 }
 if(state==="sent")return <div className="success" role="status"><b>☕ {enabled?"Am primit propunerea ta pentru o cafea în doi.":"Invitația a fost trimisă."}</b><p>{enabled?"Îți confirm personal ziua și ora dacă putem bea cafeaua împreună.":"Mulțumesc că mi-ai scris. Dacă există interes reciproc, continuăm pe WhatsApp."}</p></div>;
 return <form ref={formRef} onSubmit={submit} encType="multipart/form-data" className="invite-form">
  <div className="invite-steps" aria-label="Progres formular"><span className={step===1?"active":"done"}><b>{step===1?"1":"✓"}</b> Despre tine</span><i/><span className={step===2?"active":""}><b>2</b> Contact și cafea</span></div>
  <section className={step===1?"invite-step active":"invite-step"} aria-hidden={step!==1}>
   <h3>Mai întâi, câteva lucruri despre tine</h3><p>Doar cât să-mi fac o primă impresie. Durează aproximativ un minut.</p>
   <div className="row"><div><label htmlFor="invite-prenume">Prenume *</label><input id="invite-prenume" name="prenume" autoComplete="given-name" maxLength={80} required tabIndex={step===1?0:-1}/></div><div><label htmlFor="invite-varsta">Vârsta *</label><input id="invite-varsta" name="varsta" type="number" min="18" max="99" required tabIndex={step===1?0:-1}/></div></div>
   <div className="row"><div><label htmlFor="invite-localitate">Localitate *</label><input id="invite-localitate" name="localitate" autoComplete="address-level2" maxLength={120} required tabIndex={step===1?0:-1}/></div><div><label htmlFor="invite-tara">Țară *</label><input id="invite-tara" name="tara" autoComplete="country-name" defaultValue="România" maxLength={80} required tabIndex={step===1?0:-1}/></div></div>
   <label htmlFor="invite-despre">Spune-mi puțin despre tine *</label><textarea id="invite-despre" name="despre" maxLength={3000} placeholder="Ce îți place, cum îți petreci timpul și ce cauți într-o relație…" required tabIndex={step===1?0:-1}/>
   <button type="button" className="btn invite-next" onClick={next}>Continuă →</button>
  </section>
  <section className={step===2?"invite-step active":"invite-step"} aria-hidden={step!==2}>
   <h3>Cum putem continua conversația?</h3><p>Datele rămân private și sunt folosite numai pentru această invitație.</p>
   <label htmlFor="invite-email">Email *</label><input id="invite-email" name="email" type="email" autoComplete="email" maxLength={254} required tabIndex={step===2?0:-1}/>
   <label htmlFor="invite-whatsapp">Număr WhatsApp *</label><input id="invite-whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="+40 7xx xxx xxx" pattern="^[+0-9][0-9 ()-]{6,24}$" maxLength={25} required tabIndex={step===2?0:-1}/>
   <label htmlFor="invite-photo">Fotografie recentă <span className="optional">opțional</span></label><input id="invite-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="invite-photo-help" tabIndex={step===2?0:-1}/><small id="invite-photo-help">Dacă vrei să trimiți una: JPG, PNG sau WebP, maximum 5 MB.</small>
   <div className="coffee-slots">{loadingSlots?<p>Se încarcă programul…</p>:enabled?slots.length?<CoffeeBookingPicker slots={slots} value={selectedSlot} onChange={setSelectedSlot}/>:<p>Nu există intervale libere în următoarele 14 zile.</p>:<p>Programările nu sunt deschise momentan. Poți trimite o invitație fără oră propusă.</p>}</div>
   <div aria-hidden="true" style={{position:"absolute",left:"-10000px",width:1,height:1,overflow:"hidden"}}><label htmlFor="invite-website">Website</label><input id="invite-website" name="website" tabIndex={-1} autoComplete="off"/></div>
   <label className="check"><input name="ageOk" type="checkbox" required tabIndex={step===2?0:-1}/>Confirm că am cel puțin 18 ani.</label>
   <label className="check"><input name="whatsappOptIn" type="checkbox" tabIndex={step===2?0:-1}/>Doresc să primesc confirmarea întâlnirii și pe WhatsApp la numărul introdus.</label>
   <label className="check"><input name="privacyOk" type="checkbox" required tabIndex={step===2?0:-1}/>Sunt de acord cu prelucrarea datelor și, dacă aleg să o trimit, a fotografiei, conform <Link href="/confidentialitate">Politicii de confidențialitate</Link>.</label>
   {state==="error"&&<div className="formerror" role="alert">{error}</div>}
   <div className="invite-actions"><button type="button" className="btn alt" onClick={()=>setStep(1)}>← Înapoi</button><button disabled={state==="sending"||loadingSlots||enabled&&!slots.length} className="btn">{state==="sending"?"Se trimite…":enabled?"☕ Propune cafeaua":"☕ Trimite invitația"}</button></div>
  </section>
 </form>
}
