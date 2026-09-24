"use client";

const CONSENT_KEY="cafeaindoi-google-consent";
const VISITOR_KEY="cafeaindoi-analytics-visitor-v1";
const SESSION_KEY="cafeaindoi-analytics-session-v1";

export type AnalyticsEvent=
 |"page_view"
 |"compatibility_started"
 |"compatibility_step_completed"
 |"compatibility_completed"
 |"invitation_started"
 |"invitation_step_completed"
 |"invitation_media_ready"
 |"invitation_submitted"
 |"video_call_started";

function uuid(){return crypto.randomUUID()}
function identifier(storage:Storage,key:string){let value=storage.getItem(key);if(!value){value=uuid();storage.setItem(key,value)}return value}

export function analyticsAllowed(){return typeof window!=="undefined"&&localStorage.getItem(CONSENT_KEY)==="granted"}

export function trackAnalytics(event:AnalyticsEvent,metadata:Record<string,string|number|boolean>={}){
 if(!analyticsAllowed())return;
 const query=new URLSearchParams(location.search);
 const body={
  sessionId:identifier(sessionStorage,SESSION_KEY),
  visitorId:identifier(localStorage,VISITOR_KEY),
  event,
  path:location.pathname,
  referrer:document.referrer,
  attribution:{source:query.get("utm_source"),medium:query.get("utm_medium"),campaign:query.get("utm_campaign"),content:query.get("utm_content"),term:query.get("utm_term"),gclid:query.get("gclid")},
  device:window.matchMedia("(max-width: 700px)").matches?"mobile":window.matchMedia("(max-width: 1024px)").matches?"tablet":"desktop",
  metadata
 };
 void fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),keepalive:true}).catch(()=>{});
}
