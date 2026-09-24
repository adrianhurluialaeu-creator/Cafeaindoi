const config=()=>{
 const domain=(process.env.METERED_DOMAIN||"cafeaindoi.metered.live").replace(/^https?:\/\//,"").replace(/\/$/,"");
 const secret=process.env.METERED_SECRET_KEY;
 if(!secret)throw new Error("Apelul video nu este configurat încă.");
 return {domain,secret};
};

async function metered(path:string,body:Record<string,unknown>){
 const {domain,secret}=config();
 const response=await fetch(`https://${domain}${path}?secretKey=${encodeURIComponent(secret)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store",signal:AbortSignal.timeout(10_000)});
 const result=await response.json().catch(()=>({}));
 if(!response.ok){console.error("[metered] API_ERROR",{path,status:response.status,reason:result?.reason||result?.message||result?.error});if(response.status===401)throw new Error("Cheia Metered nu este validă pentru acest domeniu.");if(response.status===403)throw new Error("Contul Metered nu permite această acțiune.");if(response.status===400)throw new Error("Metered a respins configurarea camerei video.");throw new Error("Serviciul video nu este disponibil momentan.")}
 return result;
}

export function meetingRoomName(invitationId:string,meetingId:string){return `cafea-${invitationId.slice(0,8)}-${meetingId.slice(0,8)}`}

export async function createPrivateRoom(roomName:string){
 try{await metered("/api/v1/room",{roomName,privacy:"private",maxParticipants:2,autoJoin:true,enableChat:false,enableScreenSharing:false,joinVideoOn:false,joinAudioOn:false,recordRoom:false,ejectAtRoomExp:false})}
 catch(error){if(!/exist|already|duplicate/i.test((error as Error).message))throw error}
 return roomName;
}

export async function createRoomAccess(roomName:string,name:string,isAdmin:boolean){
 const {domain}=config();
 const token=await metered("/api/v1/token",{roomName,name:name.slice(0,80),isAdmin,globalToken:false,expireUnixSec:Math.floor(Date.now()/1000)+2*60*60});
 const accessToken=token?.token||token?.accessToken;
 if(!accessToken)throw new Error("Accesul la apel nu a putut fi creat.");
 return {roomURL:`https://${domain}/${roomName}`,accessToken:String(accessToken)};
}
