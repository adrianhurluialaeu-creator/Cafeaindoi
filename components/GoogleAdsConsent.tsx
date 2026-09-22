"use client";
import Script from "next/script";
import {useEffect,useState} from "react";
declare global{interface Window{dataLayer:any[];gtag?:(...args:any[])=>void}}
const KEY="cafeaindoi-google-consent";
function update(granted:boolean){window.gtag?.("consent","update",{ad_storage:granted?"granted":"denied",ad_user_data:granted?"granted":"denied",ad_personalization:granted?"granted":"denied",analytics_storage:granted?"granted":"denied"});}
export default function GoogleAdsConsent(){
 const [choice,setChoice]=useState<string|null>(null);
 useEffect(()=>{const v=localStorage.getItem(KEY);setChoice(v);if(v)update(v==="granted");},[]);
 function choose(v:"granted"|"denied"){localStorage.setItem(KEY,v);setChoice(v);update(v==="granted");}
 return <><Script id="google-consent-default" strategy="beforeInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});gtag('set','ads_data_redaction',true);`}</Script><Script src="https://www.googletagmanager.com/gtag/js?id=AW-18467510680" strategy="afterInteractive"/><Script id="google-ads-tag" strategy="afterInteractive">{`gtag('js',new Date());gtag('config','AW-18467510680');`}</Script>{choice===null&&<div className="consent-banner" role="dialog" aria-label="Preferințe cookies"><p><strong>Cookies pentru publicitate și măsurare</strong><br/>Folosim Google Ads pentru a măsura eficiența reclamelor numai dacă accepți. Poți refuza și folosi site-ul în continuare.</p><div><button className="btn" onClick={()=>choose("granted")}>Accept</button><button className="btn secondary" onClick={()=>choose("denied")}>Refuz</button><a href="/cookies">Detalii</a></div></div>}</>
}