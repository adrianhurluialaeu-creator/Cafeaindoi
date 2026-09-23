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
  image:`${base}/images/01_cafea_in_doi.webp`,
  description:"Adrian se prezintă sincer înaintea primei cafele: viață, valori, familie, muncă și felul în care vede o relație serioasă.",
  knowsLanguage:["ro","cs","de"],
  mainEntityOfPage:base
 }}/>;
}

export function WebsiteStructuredData(){
 return <JsonLd data={{"@context":"https://schema.org","@type":"WebSite",name:"Cafea în Doi",alternateName:"cafeaindoi.eu",url:base,inLanguage:"ro-RO",author:{"@type":"Person",name:"Adrian Hurluiala",url:`${base}/povestea-mea`}}}/>;
}

export function ArticleStructuredData({title,description,path,datePublished,dateModified}:{title:string;description:string;path:string;datePublished:string;dateModified?:string}){
 return <JsonLd data={{"@context":"https://schema.org","@graph":[{"@type":"Article",headline:title,description,url:`${base}${path}`,mainEntityOfPage:`${base}${path}`,inLanguage:"ro-RO",datePublished,dateModified:dateModified||datePublished,author:{"@type":"Person",name:"Adrian Hurluiala",url:`${base}/povestea-mea`},publisher:{"@type":"Person",name:"Adrian Hurluiala",url:base},image:`${base}/images/ChatGPT Image 20 sept. 2026, 20_47_04.webp`},{"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Cafea în Doi",item:base},{"@type":"ListItem",position:2,name:"Gândurile mele",item:`${base}/blog`},{"@type":"ListItem",position:3,name:title,item:`${base}${path}`}]}]}}/>;
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
