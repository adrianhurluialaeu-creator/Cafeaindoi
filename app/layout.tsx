import "./globals.css";
import type {Metadata} from "next";
import {Allura,Cormorant_Garamond,Libre_Baskerville} from "next/font/google";
import GoogleAdsConsent from "../components/GoogleAdsConsent";
import AnalyticsTracker from "../components/AnalyticsTracker";
import {PersonStructuredData,WebsiteStructuredData} from "../components/StructuredData";

const declarationTitle=Cormorant_Garamond({subsets:["latin"],weight:["400","500","600"],style:["normal","italic"],display:"swap",variable:"--font-declaration-title"});
const declarationBody=Libre_Baskerville({subsets:["latin"],weight:["400","700"],style:["normal","italic"],display:"swap",variable:"--font-declaration-body"});
const declarationSignature=Allura({subsets:["latin"],weight:"400",display:"swap",variable:"--font-declaration-signature"});

export const metadata:Metadata={
 metadataBase:new URL("https://www.cafeaindoi.eu"),
 title:{default:"Cafea în Doi",template:"%s | Cafea în Doi"},
 description:"Prima cafea o bem online. O invitație personală pentru o relație serioasă.",
icons:{icon:[{url:"/images/cafeaindoi-icon.png",type:"image/png",sizes:"512x512"}],shortcut:"/images/cafeaindoi-icon.png",apple:[{url:"/images/cafeaindoi-icon.png",sizes:"512x512",type:"image/png"}]},
openGraph:{type:"website",locale:"ro_RO",url:"https://www.cafeaindoi.eu",siteName:"Cafea în Doi",title:"Cafea în Doi",description:"Prima cafea o bem online. O invitație personală pentru o relație serioasă.",images:[{url:"/images/ChatGPT Image 20 sept. 2026, 20_47_04.webp",width:1536,height:512,alt:"Cafea în Doi — mai mult decât o cafea"}]},
twitter:{card:"summary_large_image",title:"Cafea în Doi",description:"Prima cafea o bem online.",images:["/images/ChatGPT Image 20 sept. 2026, 20_47_04.webp"]},
 robots:{index:true,follow:true}
};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="ro" className={`${declarationTitle.variable} ${declarationBody.variable} ${declarationSignature.variable}`}><body><PersonStructuredData/><WebsiteStructuredData/><AnalyticsTracker/>{children}<GoogleAdsConsent/></body></html>
}
