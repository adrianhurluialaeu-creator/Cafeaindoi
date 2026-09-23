"use client";
import {useEffect,useRef,useState} from "react";

type Slot={start:string;label:string};
const dateLabel=new Intl.DateTimeFormat("ro-RO",{timeZone:"Europe/Bucharest",weekday:"long",day:"numeric",month:"long"});
const compactDate=new Intl.DateTimeFormat("ro-RO",{timeZone:"Europe/Bucharest",weekday:"short",day:"numeric",month:"short"});
const hourLabel=new Intl.DateTimeFormat("ro-RO",{timeZone:"Europe/Bucharest",hour:"2-digit",minute:"2-digit"});
export default function CoffeeBookingPicker({slots,value,onChange}:{slots:Slot[];value:string;onChange:(start:string)=>void}){
 const [open,setOpen]=useState(false),[day,setDay]=useState(""),[draft,setDraft]=useState("");
 const closeRef=useRef<HTMLButtonElement>(null),openRef=useRef<HTMLButtonElement>(null);
 const groups=slots.reduce<Record<string,Slot[]>>((all,slot)=>{const key=dateLabel.format(new Date(slot.start));(all[key]??=[]).push(slot);return all},{});
 const days=Object.keys(groups);
 useEffect(()=>{if(!open)return;const old=document.body.style.overflow;document.body.style.overflow="hidden";closeRef.current?.focus();function key(e:KeyboardEvent){if(e.key==="Escape"){setOpen(false);return}if(e.key!=="Tab")return;const controls=[...document.querySelectorAll<HTMLButtonElement>("#coffee-picker-dialog button:not([disabled])")];if(!controls.length)return;const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}document.addEventListener("keydown",key);return()=>{document.body.style.overflow=old;document.removeEventListener("keydown",key);openRef.current?.focus()}},[open]);
 function show(){const picked=slots.find(x=>x.start===value);const initial=picked?dateLabel.format(new Date(picked.start)):days[0];setDay(initial||"");setDraft(picked?.start||"");setOpen(true)}
 function chooseDay(next:string){setDay(next);setDraft("")}
 const chosen=slots.find(x=>x.start===value);
 return <div className="coffee-picker"><h3>Ziua și ora cafelei *</h3><button ref={openRef} type="button" className="coffee-picker-trigger" onClick={show} aria-haspopup="dialog" aria-expanded={open}>{chosen?<><strong>{dateLabel.format(new Date(chosen.start))} · {hourLabel.format(new Date(chosen.start))}</strong><span>Schimbă ziua și ora</span></>:"Alege ziua și ora"}</button><small>Orele sunt afișate în ora României. Alegerea ta așteaptă confirmarea mea.</small>
 {open&&<div className="coffee-picker-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}><div id="coffee-picker-dialog" className="coffee-picker-dialog" role="dialog" aria-modal="true" aria-labelledby="coffee-picker-title"><div className="coffee-picker-head"><div><h3 id="coffee-picker-title">Alege ziua și ora</h3><p>Orele sunt afișate în ora României.</p></div><button ref={closeRef} type="button" className="coffee-picker-close" onClick={()=>setOpen(false)} aria-label="Închide">×</button></div><div className="coffee-picker-dates" aria-label="Zile disponibile">{days.map(key=><button type="button" className={day===key?"active":""} aria-pressed={day===key} onClick={()=>chooseDay(key)} key={key}>{compactDate.format(new Date(groups[key][0].start))}</button>)}</div><h4>{day}</h4><div className="coffee-picker-hours" aria-label="Ore disponibile">{(groups[day]||[]).map(slot=><button type="button" className={draft===slot.start?"active":""} aria-pressed={draft===slot.start} key={slot.start} onClick={()=>setDraft(slot.start)}>{hourLabel.format(new Date(slot.start))}</button>)}</div><p className="coffee-picker-note">Momentul ales așteaptă confirmarea mea.</p><button type="button" className="coffee-picker-confirm" disabled={!draft} onClick={()=>{onChange(draft);setOpen(false)}}>Confirmă alegerea</button></div></div>}
 </div>;
}
