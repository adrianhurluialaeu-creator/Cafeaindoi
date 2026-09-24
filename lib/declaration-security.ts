const OWN_HOSTS=new Set(["cafeaindoi.eu","www.cafeaindoi.eu"]);

export function validateDeclarationImage(value:unknown){
 const imageUrl=String(value||"").trim().slice(0,1000);
 if(!imageUrl)return "";
 try{
  const url=new URL(imageUrl);
  if(url.protocol!=="https:"||!OWN_HOSTS.has(url.hostname.toLowerCase())||url.username||url.password)return null;
  return url.toString();
 }catch{return null}
}
