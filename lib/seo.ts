import type {Metadata} from "next";
const socialImage="/images/ChatGPT Image 20 sept. 2026, 20_47_04.webp";
export function articleMetadata({title,description,path}:{title:string;description:string;path:string}):Metadata{return{title,description,alternates:{canonical:path},openGraph:{type:"article",locale:"ro_RO",url:path,siteName:"Cafea în Doi",title,description,images:[{url:socialImage,width:1536,height:512,alt:"Cafea în Doi"}]},twitter:{card:"summary_large_image",title,description,images:[socialImage]}}}
