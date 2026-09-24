"use client";
import {useMemo,useState} from "react";
import {trackAnalytics} from "../lib/analytics-client";
type Q={t:string;c:number;target:number};
const cats=["❤️ Relație","💬 Comunicare","⚖️ Conflicte","💕 Afecțiune","👨‍👩‍👧 Familie","🌿 Stil de viață","🏠 Viața împreună","💶 Bani și muncă","🌍 Viitor","🧭 Încredere"];
const qs:Q[]=[
 {t:"Îmi doresc o relație serioasă, exclusivă și stabilă.",c:0,target:5},{t:"Valorile comune sunt importante pentru o viață în doi.",c:0,target:5},
 {t:"Pot spune direct ce simt și ce mă deranjează.",c:1,target:5},{t:"Pot asculta fără să transform imediat conversația într-o dezbatere.",c:1,target:4},
 {t:"Prefer să rezolvăm conflictele fără jigniri sau amenințări.",c:2,target:5},{t:"Pot oferi puțin spațiu, apoi revin la discuție și la împăcare.",c:2,target:5},
 {t:"Afecțiunea și gesturile mici trebuie păstrate și într-o relație stabilă.",c:3,target:4},{t:"Pot vorbi deschis despre apropiere și nevoile intime.",c:3,target:4},
 {t:"Pot accepta că partenerul are deja un copil.",c:4,target:5},{t:"Îmi doresc să construiesc o familie și tradiții proprii.",c:4,target:5},
 {t:"Îmi place un echilibru între seri liniștite și experiențe noi.",c:5,target:5},{t:"Prefer un stil de viață sănătos, cu foarte puțin alcool sau deloc.",c:5,target:4},
 {t:"Treburile casei și deciziile importante trebuie împărțite echitabil.",c:6,target:5},{t:"Îmi doresc timp împreună, dar respect și timpul personal.",c:6,target:5},
 {t:"Banii, datoriile și obiectivele mari trebuie discutate sincer.",c:7,target:5},{t:"Aș susține un proiect important al partenerului dacă există responsabilitate.",c:7,target:5},
 {t:"Aș lua în calcul alt oraș sau altă țară pentru un plan comun bun.",c:8,target:5},{t:"Îmi doresc un plan stabil pentru următorii cinci-zece ani.",c:8,target:5},
 {t:"Pot avea încredere fără să verific telefonul sau locația partenerului.",c:9,target:5},{t:"Gelozia nu trebuie să devină control.",c:9,target:5}
];
const pts=[0,2,5,8,10],pageSize=5,totalPages=4;
export default function CompatibilityTest(){
 const [answers,setAnswers]=useState<number[]>(Array(qs.length).fill(0)),[step,setStep]=useState(0);
 const [started,setStarted]=useState(false);
 const done=answers.filter(Boolean).length,start=step*pageSize;
 const result=useMemo(()=>{const by=Array(cats.length).fill(0);answers.forEach((v,i)=>{if(v)by[qs[i].c]+=pts[4-Math.abs(v-qs[i].target)]});return{by,total:by.reduce((x,y)=>x+y,0)}},[answers]);
 const go=(n:number)=>{if(n>step){trackAnalytics("compatibility_step_completed",{step:step+1});if(n===totalPages)trackAnalytics("compatibility_completed",{scoreBand:result.total>=170?"high":result.total>=130?"good":result.total>=90?"mixed":"low"})}setStep(n);requestAnimationFrame(()=>document.querySelector(".compat")?.scrollIntoView({behavior:"smooth",block:"start"}))};
 const level=result.total>=170?"Avem multe puncte comune":result.total>=130?"Există o bază bună de explorat":result.total>=90?"Avem atât asemănări, cât și diferențe":result.total?"Diferențele merită discutate sincer":"";
 return <div className="compat">
  <div className="quick-test-head"><div><span className="eyebrow">Test rapid · aproximativ 3 minute</span><h2>{step<totalPages?`Pasul ${step+1} din ${totalPages}`:"Rezultatul tău"}</h2></div><strong>{done}/20</strong></div>
  <div className="compat-progress" aria-label={`${done} din 20 de răspunsuri`}><span>{Math.round(done/20*100)}% completat</span><div><i style={{width:`${done/20*100}%`}}/></div></div>
 {step<totalPages?<><p>Alege cât de mult te reprezintă fiecare afirmație.</p>{qs.slice(start,start+pageSize).map((q,j)=><fieldset className="compat-q" key={start+j}><legend>{start+j+1}. {q.t}</legend><small className="question-category">{cats[q.c]}</small><div className="scale">{["Deloc","Puțin","Parțial","Mult","Complet"].map((x,k)=><label key={x} className={answers[start+j]===k+1?"selected":""}><input type="radio" name={"q"+(start+j)} checked={answers[start+j]===k+1} onChange={()=>{if(!started){setStarted(true);trackAnalytics("compatibility_started")}const next=[...answers];next[start+j]=k+1;setAnswers(next)}}/><span>{k+1}</span><small>{x}</small></label>)}</div></fieldset>)}<div className="compat-actions">{step>0?<button type="button" className="btn alt" onClick={()=>go(step-1)}>← Înapoi</button>:<span/>}<button type="button" className="btn" disabled={answers.slice(start,start+pageSize).some(v=>!v)} onClick={()=>go(step+1)}>{step===totalPages-1?"Vezi rezultatul":"Continuă →"}</button></div></>:<><div className="compat-result"><span className="eyebrow">Compatibilitate orientativă</span><strong>{Math.round(result.total/2)}%</strong><h2>{level}</h2><p>{result.total} din 200 de puncte. Scorul compară răspunsurile tale cu felul în care vede Adrian relația; nu decide dacă doi oameni se pot plăcea.</p></div><div className="score-grid">{cats.map((c,i)=><div key={c}><strong>{c}</strong><span>{result.by[i]}/20</span></div>)}</div><div className="compat-actions"><button type="button" className="btn alt" onClick={()=>go(0)}>Revizuiește</button><a className="btn" href="/#invitatie">☕ Trimite invitația</a></div></>}
 </div>
}
