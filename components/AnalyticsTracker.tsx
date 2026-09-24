"use client";
import {usePathname} from "next/navigation";
import {useEffect,useRef} from "react";
import {analyticsAllowed,trackAnalytics} from "../lib/analytics-client";

export default function AnalyticsTracker(){
 const pathname=usePathname(),last=useRef("");
 useEffect(()=>{
  const record=()=>{const key=`${pathname}${location.search}`;if(analyticsAllowed()&&last.current!==key){trackAnalytics("page_view");last.current=key}};
  record();window.addEventListener("cafeaindoi-consent",record);
  return()=>window.removeEventListener("cafeaindoi-consent",record);
 },[pathname]);
 return null;
}
