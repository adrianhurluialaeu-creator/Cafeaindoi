import {get,list,put} from "@vercel/blob";
import {createHash,createHmac,randomBytes,scrypt as scryptCallback,timingSafeEqual} from "crypto";
import {promisify} from "util";

const scrypt=promisify(scryptCallback);
const ACCOUNT_PREFIX="portal-accounts/";
export const PORTAL_COOKIE="cafeaindoi_portal";
type PortalAccount={invitationId:string;email:string;activationHash?:string;activationExpiresAt?:string;passwordSalt?:string;passwordHash?:string;status:"invited"|"active"|"disabled";createdAt:string;activatedAt?:string};
const pathFor=(id:string)=>`${ACCOUNT_PREFIX}${id}.json`;
const digest=(value:string)=>createHash("sha256").update(value).digest("hex");
const secret=()=>process.env.PORTAL_SESSION_SECRET||process.env.ADMIN_PASSWORD||"";
const equal=(a:string,b:string)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)};

export async function readPortalAccount(invitationId:string){const r=await get(pathFor(invitationId),{access:"private",useCache:false});if(!r||r.statusCode!==200)return null;return JSON.parse(await new Response(r.stream).text()) as PortalAccount}
async function writeAccount(account:PortalAccount){await put(pathFor(account.invitationId),JSON.stringify(account),{access:"private",addRandomSuffix:false,allowOverwrite:true,contentType:"application/json"})}
export async function createPortalActivation(invitationId:string,email:string){const token=randomBytes(32).toString("base64url"),now=new Date();const account:PortalAccount={invitationId,email:email.toLowerCase(),activationHash:digest(token),activationExpiresAt:new Date(now.getTime()+7*864e5).toISOString(),status:"invited",createdAt:now.toISOString()};await writeAccount(account);return token}
export async function activatePortalAccount(invitationId:string,token:string,password:string){const account=await readPortalAccount(invitationId);if(!account||account.status!=="invited"||!account.activationHash||!account.activationExpiresAt||Date.parse(account.activationExpiresAt)<Date.now()||!equal(digest(token),account.activationHash))return false;const salt=randomBytes(16).toString("hex"),hash=(await scrypt(password,salt,64) as Buffer).toString("hex");await writeAccount({...account,status:"active",passwordSalt:salt,passwordHash:hash,activationHash:undefined,activationExpiresAt:undefined,activatedAt:new Date().toISOString()});return true}
export async function authenticatePortal(email:string,password:string){const {blobs}=await list({prefix:ACCOUNT_PREFIX,limit:1000});for(const blob of blobs){const id=blob.pathname.split("/").pop()!.replace(/\.json$/,""),account=await readPortalAccount(id);if(account?.status==="active"&&account.email===email.toLowerCase()&&account.passwordSalt&&account.passwordHash){const hash=(await scrypt(password,account.passwordSalt,64) as Buffer).toString("hex");if(equal(hash,account.passwordHash))return account.invitationId}}return null}
export function createPortalSession(invitationId:string){if(!secret())throw new Error("Secretul sesiunii nu este configurat.");const payload=Buffer.from(JSON.stringify({id:invitationId,exp:Date.now()+7*864e5})).toString("base64url"),signature=createHmac("sha256",secret()).update(payload).digest("base64url");return `${payload}.${signature}`}
export function verifyPortalSession(value?:string){if(!value||!secret())return null;const [payload,signature]=value.split(".");if(!payload||!signature)return null;const expected=createHmac("sha256",secret()).update(payload).digest("base64url");if(!equal(signature,expected))return null;try{const data=JSON.parse(Buffer.from(payload,"base64url").toString()) as {id:string;exp:number};return /^[0-9a-f-]{36}$/i.test(data.id)&&data.exp>Date.now()?data.id:null}catch{return null}}
