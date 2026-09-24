const config=()=>{
 const domain=(process.env.METERED_DOMAIN||"cafeaindoi.metered.live").replace(/^https?:\/\//,"").replace(/\/$/,"");
 const secret=process.env.METERED_SECRET_KEY?.trim();
 if(!secret)throw new Error("Apelul video nu este configurat încă.");
 return {domain,secret};
};

class MeteredError extends Error{constructor(public status:number,message:string){super(message);this.name="MeteredError"}}

function errorText(value:unknown){
 if(typeof value==="string")return value;
 if(value&&typeof value==="object")try{return JSON.stringify(value)}catch{return ""}
 return value==null?"":String(value);
}

async function metered(path:string,body:Record<string,unknown>,method:"POST"|"PUT"="POST"){
 const {domain,secret}=config();
 const response=await fetch(`https://${domain}${path}?secretKey=${encodeURIComponent(secret)}`,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store",signal:AbortSignal.timeout(10_000)});
 const result=await response.json().catch(()=>({}));
 if(!response.ok){const upstream=errorText(result?.reason||result?.message||result?.error||result);console.error("[metered] API_ERROR",{path,status:response.status,reason:upstream});if(response.status===401)throw new MeteredError(401,"Cheia Metered nu este validă pentru acest domeniu.");if(response.status===403)throw new MeteredError(403,"Contul Metered nu permite această acțiune.");if(response.status===400)throw new MeteredError(400,upstream||"Metered a respins configurarea camerei video.");throw new MeteredError(response.status,"Serviciul video nu este disponibil momentan.")}
 return result;
}

export function meetingRoomName(invitationId:string,meetingId:string){return `cafea-${invitationId.slice(0,8)}-${meetingId.slice(0,8)}`}

export async function createPrivateRoom(roomName:string){
 const settings={privacy:"private",maxParticipants:2,autoJoin:false,showInviteBox:false,enableRequestToJoin:false,enableChat:false,enableScreenSharing:false,joinVideoOn:false,joinAudioOn:false,ownerOnlyBroadcast:false,audioOnlyRoom:false,recordRoom:false,ejectAtRoomExp:false};
 try{await metered("/api/v1/room",{roomName,...settings})}
 catch(error){if(!(error instanceof MeteredError&&error.status===400&&/exist|already|duplicate/i.test(error.message)))throw error;await metered(`/api/v1/room/${encodeURIComponent(roomName)}`,settings,"PUT")}
 return roomName;
}

export async function createRoomAccess(roomName:string,name:string,isAdmin:boolean){
 const {domain}=config();
 const token=await metered("/api/v1/token",{roomName,name:name.slice(0,80),isAdmin,disableVideo:false,disableAudio:false,disableScreenSharing:true,expireUnixSec:Math.floor(Date.now()/1000)+2*60*60});
 const accessToken=token?.token||token?.accessToken;
 if(!accessToken)throw new Error("Accesul la apel nu a putut fi creat.");
 return {roomURL:`${domain}/${roomName}`,accessToken:String(accessToken)};
}
