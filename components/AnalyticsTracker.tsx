"use client";
import {usePathname} from "next/navigation";
import {useEffect,useRef} from "react";
import {trackAnalytics} from "../lib/analytics-client";

export default function AnalyticsTracker(){
 const pathname=usePathname(),last=useRef("");
 useEffect(()=>{
  const record=()=>{const key=`${pathname}${location.search}`;if(last.current!==key){last.current=key;trackAnalytics("page_view")}};
  record();window.addEventListener("cafeaindoi-consent",record);
  return()=>window.removeEventListener("cafeaindoi-consent",record);
 },[pathname]);
 return null;
}
