import type {MetadataRoute} from "next";
export default function sitemap():MetadataRoute.Sitemap{const base="https://www.cafeaindoi.eu";return["","/povestea-mea","/contact","/termeni","/confidentialitate","/cookies"].map((path)=>({url:base+path,lastModified:new Date(),changeFrequency:path===""?"weekly":"monthly",priority:path===""?1:0.6}))}
