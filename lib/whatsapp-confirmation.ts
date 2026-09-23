import type {Invitation} from "./invitations";

export function whatsappConfigured(){return !!(process.env.META_WHATSAPP_TOKEN&&process.env.META_WHATSAPP_PHONE_NUMBER_ID&&process.env.META_WHATSAPP_TEMPLATE_NAME&&process.env.META_WHATSAPP_GRAPH_VERSION)}
export async function sendWhatsAppConfirmation(invitation:Invitation){
 if(!invitation.whatsappOptIn||!invitation.slotStart)throw new Error("Nu există acord pentru WhatsApp sau oră confirmată.");
 if(!whatsappConfigured())throw new Error("WhatsApp Business nu este configurat încă.");
 const to=invitation.whatsapp.replace(/\D/g,"");
 if(!/^[1-9]\d{7,14}$/.test(to))throw new Error("Numărul WhatsApp nu are prefix internațional valid.");
 const version=process.env.META_WHATSAPP_GRAPH_VERSION!;
 const phoneId=process.env.META_WHATSAPP_PHONE_NUMBER_ID!;
 if(!/^v\d+\.\d+$/.test(version)||!/^\d+$/.test(phoneId))throw new Error("Configurația WhatsApp este invalidă.");
 const dateTime=new Intl.DateTimeFormat("ro-RO",{timeZone:"Europe/Bucharest",dateStyle:"full",timeStyle:"short"}).format(new Date(invitation.slotStart));
 const body={messaging_product:"whatsapp",to,type:"template",template:{name:process.env.META_WHATSAPP_TEMPLATE_NAME,language:{code:process.env.META_WHATSAPP_TEMPLATE_LANGUAGE||"ro"},components:[{type:"body",parameters:[{type:"text",text:invitation.prenume},{type:"text",text:dateTime}]}]}};
 const response=await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`,{method:"POST",headers:{Authorization:`Bearer ${process.env.META_WHATSAPP_TOKEN}`,"Content-Type":"application/json"},body:JSON.stringify(body)});
 if(!response.ok){console.error("[whatsapp] META_ERROR",response.status,await response.text());throw new Error("WhatsApp nu a acceptat mesajul. Verifică tokenul și șablonul aprobat.")}
 const result=await response.json() as {messages?:Array<{id:string}>};
 if(!result.messages?.[0]?.id)throw new Error("WhatsApp nu a confirmat acceptarea mesajului.");
 return result.messages[0].id;
}
