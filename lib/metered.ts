const config=()=>{
 const domain=(process.env.METERED_DOMAIN||"cafeaindoi.metered.live").replace(/^https?:\/\//,"").replace(/\/$/,"");
 const secret=process.env.METERED_SECRET_KEY;
 if(!secret)throw new Error("Apelul video nu este configurat încă.");
 return {domain,secret};
};

async function metered(path:string,body:Record<string,unknown>){
 const {domain,secret}=config();
 const response=await fetch(`https://${domain}${path}?secretKey=${encodeURIComponent(secret)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store"});
 const result=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(typeof result?.message==="string"?result.message:"Serviciul video nu este disponibil momentan.");
 return result;
}

export function meetingRoomName(invitationId:string,meetingId:string){return `cafea-${invitationId.slice(0,8)}-${meetingId.slice(0,8)}`}

export async function createPrivateRoom(roomName:string){
 try{await metered("/api/v1/room",{roomName,privacy:"private",maxParticipants:2,autoJoin:true,enableChat:false,showInviteBox:false,recordRoom:false,ejectAtRoomExp:false})}
 catch(error){if(!/exist|already|duplicate/i.test((error as Error).message))throw error}
 return roomName;
}

export async function createRoomAccess(roomName:string,name:string,isAdmin:boolean){
 const {domain}=config();
 const token=await metered("/api/v1/token",{roomName,name:name.slice(0,80),isAdmin,globalToken:false});
 const accessToken=token?.token||token?.accessToken;
 if(!accessToken)throw new Error("Accesul la apel nu a putut fi creat.");
 return {roomURL:`https://${domain}/${roomName}`,accessToken:String(accessToken)};
}
