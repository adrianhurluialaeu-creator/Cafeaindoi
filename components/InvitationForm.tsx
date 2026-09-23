"use client";
import Link from "next/link";
import CoffeeBookingPicker from "./CoffeeBookingPicker";
import {FormEvent,useEffect,useState} from "react";
declare global{interface Window{dataLayer:any[];gtag?:(...args:any[])=>void}}
const MAX_PHOTO=5*1024*1024;
const PHOTO_TYPES=["image/jpeg","image/png","image/webp"];
const CONVERSION_DESTINATION="AW-18467510680/66mnCKWvgYEdEJiz_-VE";
function reportConversion(){
 // Match Google's event snippet exactly. The global Google tag is loaded by GoogleAdsConsent.
 // Push through gtag (arguments object), not a hand-built dataLayer array.
 window.dataLayer=window.dataLayer||[];
 if(typeof window.gtag!=="function"){
  window.gtag=function(){window.dataLayer.push(arguments as any)};
 }
 window.gtag("event","conversion",{
  send_to:CONVERSION_DESTINATION,
  value:1.0,
  currency:"EUR"
 });
}
export default function InvitationForm(){
 const [state,setState]=useState<"idle"|"sending"|"sent"|"error">("idle"),[error,setError]=useState("");
 const [slots,setSlots]=useState<{start:string;label:string}[]>([]),[enabled,setEnabled]=useState(false),[loadingSlots,setLoadingSlots]=useState(true);
 const [selectedSlot,setSelectedSlot]=useState("");
 useEffect(()=>{fetch("/api/program",{cache:"no-store"}).then(async r=>{if(!r.ok)throw Error();return r.json()}).then(x=>{setSlots(x.slots);setEnabled(x.enabled)}).catch(()=>setError("Programul nu poate fi încărcat. Reîncarcă pagina.")).finally(()=>setLoadingSlots(false))},[]);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setState("sending");setError("");
  const form=e.currentTarget,d=new FormData(form),photo=d.get("photo");
  if(enabled&&!selectedSlot){setError("Alege ziua și ora cafelei.");setState("error");return}
  if(enabled)d.set("slotStart",selectedSlot);
  if(!(photo instanceof File)||photo.size===0){setError("Fotografia este obligatorie.");setState("error");return}
  if(!PHOTO_TYPES.includes(photo.type)){setError("Fotografia trebuie să fie JPG, PNG sau WebP.");setState("error");return}
  if(photo.size>MAX_PHOTO){setError("Fotografia poate avea maximum 5 MB.");setState("error");return}
  try{
   const r=await fetch("/api/invitatie",{method:"POST",body:d});
   const x=await r.json();
   if(!r.ok)throw new Error(x.error||"Trimiterea a eșuat.");
   reportConversion();
   form.reset();
   setState("sent");
  }catch(err){setError(err instanceof Error?err.message:"Trimiterea a eșuat.");setState("error")}
 }
 if(state==="sent")return <div className="success"><b>☕ {enabled?"Am primit propunerea ta pentru o cafea în doi.":"Invitația a fost trimisă."}</b><p>{enabled?"Îți confirm personal ziua și ora dacă putem bea cafeaua împreună.":"Mulțumesc că mi-ai scris. Dacă există interes reciproc, continuăm pe WhatsApp."}</p></div>;
 return <form onSubmit={submit} encType="multipart/form-data"><div className="row"><div><label>Prenume *</label><input name="prenume" autoComplete="given-name" maxLength={80} required/></div><div><label>Vârsta *</label><input name="varsta" type="number" min="18" max="99" required/></div></div><div className="row"><div><label>Localitate *</label><input name="localitate" maxLength={120} required/></div><div><label>Țară *</label><input name="tara" defaultValue="România" maxLength={80} required/></div></div><label>Spune-mi puțin despre tine *</label><textarea name="despre" maxLength={3000} required/><label>Număr WhatsApp *</label><input name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="+40 7xx xxx xxx" pattern="^[+0-9][0-9 ()-]{6,24}$" maxLength={25} required/><label>Fotografie recentă *</label><input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required/><small>JPG, PNG sau WebP · maximum 5 MB. Fotografia este trimisă numai împreună cu invitația.</small><div className="coffee-slots">{loadingSlots?<p>Se încarcă programul…</p>:enabled?slots.length?<CoffeeBookingPicker slots={slots} value={selectedSlot} onChange={setSelectedSlot}/>:<p>Nu există intervale libere în următoarele 14 zile.</p>:<p>Programările nu sunt deschise momentan. Poți trimite o invitație fără oră propusă.</p>}</div><div aria-hidden="true" style={{position:"absolute",left:"-10000px",width:1,height:1,overflow:"hidden"}}><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div><label className="check"><input name="ageOk" type="checkbox" required/>Confirm că am cel puțin 18 ani.</label><label className="check"><input name="privacyOk" type="checkbox" required/>Sunt de acord cu prelucrarea datelor, inclusiv a fotografiei încărcate, pentru gestionarea acestei invitații, conform <Link href="/confidentialitate">Politicii de confidențialitate</Link>.</label>{state==="error"&&<div className="formerror" role="alert">{error}</div>}<button disabled={state==="sending"||loadingSlots||!!error&&state==="idle"||enabled&&!slots.length} className="btn" style={{width:"100%"}}>{state==="sending"?"Se trimite…":enabled?"☕ Rezervă o cafea în doi":"☕ Trimite invitația"}</button></form>
}