import {randomBytes,scrypt as scryptCallback,timingSafeEqual} from "crypto";
import {promisify} from "util";
const scrypt=promisify(scryptCallback),equal=(a:string,b:string)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)};
export async function hashAdminPassword(password:string){const salt=randomBytes(16).toString("hex"),hash=(await scrypt(password,salt,64) as Buffer).toString("hex");return `scrypt$${salt}$${hash}`}
export async function verifyAdminPassword(password:string,stored:string){const [kind,salt,expected]=stored.split("$");if(kind!=="scrypt"||!/^[a-f0-9]{32}$/.test(salt||"")||!/^[a-f0-9]{128}$/.test(expected||""))return false;const actual=(await scrypt(password,salt,64) as Buffer).toString("hex");return equal(actual,expected)}
