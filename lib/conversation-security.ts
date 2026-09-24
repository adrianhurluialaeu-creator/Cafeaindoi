import {consumeRateLimit,requestIp} from "./rate-limit";

const origins=new Set(["https://www.cafeaindoi.eu","https://cafeaindoi.eu","https://cafeaindoi.vercel.app"]);
export function trustedConversationOrigin(req:Request){
 const origin=req.headers.get("origin");
 return !!origin&&(origins.has(origin)||(process.env.NODE_ENV!=="production"&&origin.startsWith("http://localhost:")));
}
export async function allowConversationMutation(req:Request,identity:string){
 return consumeRateLimit("conversation",`${identity}:${requestIp(req)}`,30,60_000);
}
