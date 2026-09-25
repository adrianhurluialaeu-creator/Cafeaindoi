"use client";
import {useEffect,useState} from "react";
import type {AdminSettings} from "../lib/admin-settings";
import ScheduleAdmin from "./ScheduleAdmin";
import PushSettings from "./PushSettings";

type Tab="general"|"invitations"|"schedule"|"privateSpace"|"notifications"|"privacy"|"integrations"|"system";
type Integration={key:string;label:string;configured:boolean;detail:string};
type Audit={id:number;section:string;changed_at:string};
type Data={settings:AdminSettings;integrations:Integration[];audit:Audit[];system:{environment:string;database:string;rls:string}};
const tabs:{key:Tab;label:string;icon:string}[]=[
 {key:"general",label:"General",icon:"⌂"},{key:"invitations",label:"Invitații",icon:"☕"},{key:"schedule",label:"Program",icon:"◷"},{key:"privateSpace",label:"Spațiu privat",icon:"♡"},
 {key:"notifications",label:"Notificări",icon:"✉"},{key:"privacy",label:"Măsurare",icon:"▥"},{key:"integrations",label:"Integrări",icon:"⌁"},{key:"system",label:"Sistem",icon:"⚙"}
];
const labels:Record<string,string>={general:"Setări generale",invitations:"Invitații",privateSpace:"Spațiu privat",notifications:"Notificări",privacy:"Măsurare"};

function Toggle({checked,onChange,label,description}:{checked:boolean;onChange:(value:boolean)=>void;label:string;description?:string}){
 return <label className="settings-toggle"><span><strong>{label}</strong>{description?<small>{description}</small>:null}</span><input type="checkbox" checked={checked} onChange={event=>onChange(event.target.checked)}/><i aria-hidden="true"/></label>
}

export default function AdminSettingsPanel(){
 const [tab,setTab]=useState<Tab>("general"),[data,setData]=useState<Data|null>(null),[message,setMessage]=useState(""),[busy,setBusy]=useState(""),[error,setError]=useState("");
 useEffect(()=>{fetch("/api/admin/setari",{cache:"no-store"}).then(async response=>{const value=await response.json();if(!response.ok)throw Error(value.error);setData(value)}).catch(reason=>setError(reason.message||"Setările nu pot fi încărcate."))},[]);
 function update(section:keyof AdminSettings,key:string,value:string|number|boolean){setData(current=>current?{...current,settings:{...current.settings,[section]:{...current.settings[section],[key]:value}}}:current)}
 async function save(section:keyof AdminSettings){
  if(!data)return;setBusy(section);setMessage("");setError("");
  try{const response=await fetch("/api/admin/setari",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({section,value:data.settings[section]})}),value=await response.json();if(!response.ok)throw Error(value.error);setData(current=>current?{...current,settings:value.settings,integrations:value.integrations}:current);setMessage(`${labels[section]} au fost salvate.`)}
  catch(reason){setError(reason instanceof Error?reason.message:"Salvarea nu a reușit.")}finally{setBusy("")}
 }
 async function clearAnalytics(){
  const confirmation=prompt('Scrie exact „ȘTERGE STATISTICILE” pentru a șterge definitiv datele analytics.');if(confirmation!=="ȘTERGE STATISTICILE")return;
  setBusy("clear");setError("");try{const response=await fetch("/api/admin/setari",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"clear_analytics",confirmation})}),value=await response.json();if(!response.ok)throw Error(value.error);setMessage("Datele analytics au fost șterse.")}catch(reason){setError(reason instanceof Error?reason.message:"Ștergerea nu a reușit.")}finally{setBusy("")}
 }
 if(error&&!data)return <p className="formerror" role="alert">{error}</p>;
 if(!data)return <section className="settings-loading">Se încarcă setările…</section>;
 const s=data.settings;
 return <div className="settings-layout">
  <nav className="settings-nav" aria-label="Secțiuni setări">{tabs.map(item=><button type="button" key={item.key} className={tab===item.key?"active":""} onClick={()=>{setTab(item.key);setMessage("");setError("")}}><span>{item.icon}</span>{item.label}</button>)}</nav>
  <div className="settings-main">
   {message?<p className="settings-success" role="status">✓ {message}</p>:null}{error?<p className="formerror" role="alert">{error}</p>:null}
   {tab==="general"?<section className="settings-card"><header><h2>Setări generale</h2><p>Identitatea și starea generală a site-ului.</p></header>
    <div className="settings-form-grid"><label>Numele site-ului<input value={s.general.siteName} maxLength={80} onChange={e=>update("general","siteName",e.target.value)}/></label><label>Fus orar<select value={s.general.timezone} onChange={e=>update("general","timezone",e.target.value)}><option>Europe/Bucharest</option><option>Europe/Berlin</option><option>Europe/Prague</option></select></label><label className="wide">Descriere<textarea value={s.general.siteDescription} maxLength={220} onChange={e=>update("general","siteDescription",e.target.value)}/></label><label className="wide">Email de contact<input type="email" value={s.general.contactEmail} placeholder="adresa@exemplu.ro" onChange={e=>update("general","contactEmail",e.target.value)}/></label></div>
    <Toggle checked={s.general.maintenanceMode} onChange={v=>update("general","maintenanceMode",v)} label="Mod mentenanță" description="Pregătește mesajul care va fi afișat când site-ul este închis temporar."/>
    <label>Mesaj mentenanță<textarea value={s.general.maintenanceMessage} maxLength={300} onChange={e=>update("general","maintenanceMessage",e.target.value)}/></label><Save busy={busy==="general"} onClick={()=>save("general")}/>
   </section>:null}
   {tab==="invitations"?<section className="settings-card"><header><h2>Invitații</h2><p>Regulile formularului și limitele de trimitere.</p></header>
    <Toggle checked={s.invitations.enabled} onChange={v=>update("invitations","enabled",v)} label="Acceptă invitații noi"/><Toggle checked={s.invitations.mediaRequired} onChange={v=>update("invitations","mediaRequired",v)} label="Selfie sau video obligatoriu"/>
    <div className="settings-form-grid"><label>Vârsta minimă<input type="number" min={18} max={99} value={s.invitations.minAge} onChange={e=>update("invitations","minAge",Number(e.target.value))}/></label><label>Limită invitații / zi<input type="number" min={1} max={500} value={s.invitations.dailyLimit} onChange={e=>update("invitations","dailyLimit",Number(e.target.value))}/></label><label>Durată video maximă<input type="number" min={1} max={30} value={s.invitations.maxVideoSeconds} onChange={e=>update("invitations","maxVideoSeconds",Number(e.target.value))}/></label><label className="wide">Mesaj după trimitere<textarea value={s.invitations.successMessage} onChange={e=>update("invitations","successMessage",e.target.value)}/></label></div><Save busy={busy==="invitations"} onClick={()=>save("invitations")}/>
   </section>:null}
   {tab==="schedule"?<section className="settings-stack"><ScheduleAdmin/></section>:null}
   {tab==="privateSpace"?<section className="settings-card"><header><h2>Spațiu privat</h2><p>Funcțiile disponibile după activarea contului.</p></header>
    <div className="settings-toggle-grid"><Toggle checked={s.privateSpace.messages} onChange={v=>update("privateSpace","messages",v)} label="Mesaje"/><Toggle checked={s.privateSpace.declarations} onChange={v=>update("privateSpace","declarations",v)} label="Declarații"/><Toggle checked={s.privateSpace.challenges} onChange={v=>update("privateSpace","challenges",v)} label="Provocări"/><Toggle checked={s.privateSpace.reactions} onChange={v=>update("privateSpace","reactions",v)} label="Reacții"/><Toggle checked={s.privateSpace.videoCalls} onChange={v=>update("privateSpace","videoCalls",v)} label="Apel audio"/></div>
    <div className="settings-form-grid"><label>Durata sesiunii Admin (ore)<input type="number" min={1} max={720} value={s.privateSpace.sessionHours} onChange={e=>update("privateSpace","sessionHours",Number(e.target.value))}/></label><label>Păstrarea conversației (zile)<input type="number" min={1} max={365} value={s.privateSpace.retentionDays} onChange={e=>update("privateSpace","retentionDays",Number(e.target.value))}/></label><label>Durata maximă apel (minute)<input type="number" min={5} max={240} value={s.privateSpace.maxVideoMinutes} onChange={e=>update("privateSpace","maxVideoMinutes",Number(e.target.value))}/></label></div><Save busy={busy==="privateSpace"} onClick={()=>save("privateSpace")}/>
   </section>:null}
   {tab==="notifications"?<section className="settings-stack"><section className="settings-card"><header><h2>Reguli de notificare</h2><p>Alege canalele și evenimentele importante.</p></header><Toggle checked={s.notifications.push} onChange={v=>update("notifications","push",v)} label="Notificări push"/><Toggle checked={s.notifications.email} onChange={v=>update("notifications","email",v)} label="Notificări email"/><div className="settings-toggle-grid"><Toggle checked={s.notifications.onInvitation} onChange={v=>update("notifications","onInvitation",v)} label="Invitație nouă"/><Toggle checked={s.notifications.onActivation} onChange={v=>update("notifications","onActivation",v)} label="Cont activat"/><Toggle checked={s.notifications.onMessage} onChange={v=>update("notifications","onMessage",v)} label="Mesaj nou"/><Toggle checked={s.notifications.onMeeting} onChange={v=>update("notifications","onMeeting",v)} label="Cafea propusă"/><Toggle checked={s.notifications.onVideo} onChange={v=>update("notifications","onVideo",v)} label="Apel audio"/></div><Save busy={busy==="notifications"} onClick={()=>save("notifications")}/></section><section className="settings-card"><PushSettings/></section></section>:null}
   {tab==="privacy"?<section className="settings-card"><header><h2>Măsurare și confidențialitate</h2><p>Controlează colectarea first-party și consimțământul.</p></header><Toggle checked={s.privacy.analyticsEnabled} onChange={v=>update("privacy","analyticsEnabled",v)} label="Analytics first-party"/><Toggle checked={s.privacy.googleAdsEnabled} onChange={v=>update("privacy","googleAdsEnabled",v)} label="Google Ads"/><div className="settings-form-grid"><label>Perioada de păstrare (zile)<input type="number" min={30} max={730} value={s.privacy.retentionDays} onChange={e=>update("privacy","retentionDays",Number(e.target.value))}/></label><label className="wide">Titlu consimțământ<input value={s.privacy.consentTitle} onChange={e=>update("privacy","consentTitle",e.target.value)}/></label><label className="wide">Text consimțământ<textarea value={s.privacy.consentText} onChange={e=>update("privacy","consentText",e.target.value)}/></label></div><div className="settings-danger"><div><strong>Ștergere date analytics</strong><small>Acțiunea este definitivă și nu afectează invitațiile sau conversațiile.</small></div><button type="button" disabled={busy==="clear"} onClick={clearAnalytics}>{busy==="clear"?"Se șterg…":"Șterge statisticile"}</button></div><Save busy={busy==="privacy"} onClick={()=>save("privacy")}/>
   </section>:null}
   {tab==="integrations"?<section className="settings-card"><header><h2>Integrări</h2><p>Starea serviciilor externe. Cheile secrete nu sunt afișate.</p></header><div className="integration-grid">{data.integrations.map(item=><article key={item.key}><span className={item.configured?"connected":"missing"}>{item.configured?"✓":"!"}</span><div><strong>{item.label}</strong><small>{item.detail}</small></div><em>{item.configured?"Conectat":"Configurare incompletă"}</em></article>)}</div></section>:null}
   {tab==="system"?<section className="settings-stack"><section className="settings-card"><header><h2>Sistem și securitate</h2><p>Informații operaționale fără expunerea secretelor.</p></header><dl className="system-status"><div><dt>Mediu</dt><dd>{data.system.environment}</dd></div><div><dt>Bază de date</dt><dd className="ok">{data.system.database}</dd></div><div><dt>RLS</dt><dd className="ok">{data.system.rls}</dd></div><div><dt>Sesiune Admin</dt><dd>8 ore · cookie semnat</dd></div></dl></section><section className="settings-card"><header><h2>Jurnal setări</h2><p>Ultimele modificări salvate din această pagină.</p></header><ol className="settings-audit">{data.audit.length?data.audit.map(item=><li key={item.id}><strong>{labels[item.section]||item.section}</strong><time>{new Intl.DateTimeFormat("ro-RO",{dateStyle:"medium",timeStyle:"short"}).format(new Date(item.changed_at))}</time></li>):<li>Nu există încă modificări.</li>}</ol></section></section>:null}
  </div>
 </div>
}

function Save({busy,onClick}:{busy:boolean;onClick:()=>void}){return <div className="settings-save"><button type="button" disabled={busy} onClick={onClick}>{busy?"Se salvează…":"Salvează secțiunea"}</button></div>}
