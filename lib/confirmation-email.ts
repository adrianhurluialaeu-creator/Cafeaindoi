import type {Invitation} from "./invitations";
const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]||char));
export async function sendConfirmationEmail(invitation:Invitation){
 if(!invitation.email||!invitation.slotStart)throw new Error("Invitația nu conține o adresă de email sau o oră.");
 const key=process.env.RESEND_API_KEY_V2||process.env.RESEND_API_KEY;
 const from=process.env.CONFIRMATION_FROM_EMAIL||process.env.INVITATION_FROM_EMAIL;
 if(!key||!from)throw new Error("Emailul de confirmare nu este configurat.");
 const time=new Intl.DateTimeFormat("ro-RO",{timeZone:"Europe/Bucharest",dateStyle:"full",timeStyle:"short"}).format(new Date(invitation.slotStart));
 const subject="Cafea în Doi — întâlnirea noastră este confirmată";
 const text=`Bună, ${invitation.prenume}!\n\nConfirm cafeaua noastră pentru ${time} (ora României).\n\nÎți voi scrie pe WhatsApp pentru detaliile conversației.\n\nAdrian · Cafea în Doi`;
 const html=`<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#33241f"><h2>☕ Cafea în Doi</h2><p>Bună, ${escapeHtml(invitation.prenume)}!</p><p>Confirm cafeaua noastră pentru <strong>${escapeHtml(time)} (ora României)</strong>.</p><p>Îți voi scrie pe WhatsApp pentru detaliile conversației.</p><p>Adrian · Cafea în Doi</p></div>`;
 const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({from,to:[invitation.email],subject,text,html})});
 if(!response.ok){console.error("[confirmation] RESEND_ERROR",response.status,await response.text());throw new Error("Emailul nu a putut fi trimis. Verifică adresa și domeniul de trimitere.")}
}
