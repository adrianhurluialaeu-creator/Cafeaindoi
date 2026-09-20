import "./globals.css";
import type {Metadata} from "next";
export const metadata:Metadata={
 metadataBase:new URL("https://www.cafeaindoi.eu"),
 title:{default:"Cafea în Doi",template:"%s | Cafea în Doi"},
 description:"Prima cafea o bem online. O invitație personală pentru o relație serioasă.",
 alternates:{canonical:"/"},
 openGraph:{type:"website",locale:"ro_RO",url:"https://www.cafeaindoi.eu",siteName:"Cafea în Doi",title:"Cafea în Doi",description:"Prima cafea o bem online. O invitație personală pentru o relație serioasă.",images:[{url:"/images/01_cafea_in_doi.png",width:800,height:1200,alt:"Cafea în Doi"}]},
 twitter:{card:"summary_large_image",title:"Cafea în Doi",description:"Prima cafea o bem online.",images:["/images/01_cafea_in_doi.png"]},
 robots:{index:true,follow:true}
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ro"><body>{children}</body></html>}