const base="https://www.cafeaindoi.eu";

function JsonLd({data}:{data:Record<string,unknown>}){
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,"\\u003c")}}/>;
}

export function PersonStructuredData(){
 return <JsonLd data={{
  "@context":"https://schema.org",
  "@type":"Person",
  name:"Adrian Hurluiala",
  url:base,
  image:`${base}/images/01_cafea_in_doi.png`,
  description:"Adrian se prezintă sincer înaintea primei cafele: viață, valori, familie, muncă și felul în care vede o relație serioasă.",
  knowsLanguage:["ro","cs","de"],
  mainEntityOfPage:base
 }}/>;
}

export function BlogBreadcrumbStructuredData(){
 return <JsonLd data={{
  "@context":"https://schema.org",
  "@type":"BreadcrumbList",
  itemListElement:[
   {"@type":"ListItem",position:1,name:"Cafea în Doi",item:base},
   {"@type":"ListItem",position:2,name:"Gândurile mele",item:`${base}/blog`}
  ]
 }}/>;
}
