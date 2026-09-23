import type {Invitation} from "./invitations";

const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]!));

export async function sendMeetingLocationEmail(invitation:Invitation){
 const meeting=invitation.physicalMeeting;
 if(!invitation.email||!meeting||meeting.status!=="confirmata"||!meeting.place||!meeting.address)throw new Error("Confirmă întâlnirea și completează locul și adresa.");
 const key=process.env.RESEND_API_KEY_V2,from=process.env.INVITATION_FROM_EMAIL||"Cafea în Doi <onboarding@resend.dev>";
 if(!key)throw new Error("Configurația de email este incompletă.");
 const when=meeting.dateTime?new Intl.DateTimeFormat("ro-RO",{dateStyle:"full",timeStyle:"short"}).format(new Date(meeting.dateTime)):"Data și ora vor fi stabilite împreună";
 const map=meeting.mapUrl&&/^https:\/\/(maps\.app\.goo\.gl|www\.google\.[^/]+\/maps|maps\.google\.[^/]+)/i.test(meeting.mapUrl)?meeting.mapUrl:"";
 const text=[`Bună, ${invitation.prenume}!`,``,`Întâlnirea noastră este confirmată.`,`Loc: ${meeting.place}`,`Adresă: ${meeting.address}`,`Oraș: ${meeting.city}`,`Data: ${when}`,map?`Hartă: ${map}`:"",meeting.note?`Mesaj: ${meeting.note}`:"","Adrian · Cafea în Doi"].filter(Boolean).join("\n");
 const html=`<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#33241f"><h2>☕ Cafea în Doi</h2><p>Bună, ${escapeHtml(invitation.prenume)}!</p><p>Întâlnirea noastră este confirmată. Mai jos găsești locația:</p><div style="border:1px solid #eaded8;border-radius:14px;padding:20px;background:#fffaf7"><p><strong>${escapeHtml(meeting.place)}</strong><br>${escapeHtml(meeting.address)}<br>${escapeHtml(meeting.city)}</p><p><strong>Data:</strong> ${escapeHtml(when)}</p>${meeting.note?`<p>${escapeHtml(meeting.note)}</p>`:""}${map?`<p><a href="${escapeHtml(map)}">Deschide în Google Maps</a></p>`:""}</div><p>Adrian · Cafea în Doi</p></div>`;
 const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({from,to:[invitation.email],subject:"Locația întâlnirii noastre · Cafea în Doi",text,html})});
 if(!response.ok)throw new Error("Locația nu a putut fi trimisă pe email.");
}
