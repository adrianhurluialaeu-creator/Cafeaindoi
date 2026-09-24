"use client";
import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/navigation";
import ConversationPanel from "./ConversationPanel";

type Item={id:string;prenume:string;localitate:string;tara:string;lastMessage?:string;lastActivityAt?:string;expiresAt?:string;meetingStatus?:string};
export default function AdminConversationHub({items,selectedId}:{items:Item[];selectedId:string}){
 const router=useRouter(),selected=items.find(item=>item.id===selectedId);
 if(!items.length)return <div className="admin-v2-placeholder"><div className="admin-v2-placeholder-icon">💬</div><h2>Nicio conversație activă</h2><p>Activează mai întâi accesul unei invitate la „Povestea noastră”.</p></div>;
 if(selected)return <div className="conversation-fullscreen"><ConversationPanel role="adrian" invitationId={selected.id} partnerName={selected.prenume} onBack={()=>router.push("/admin/conversatii")} fullscreen/></div>;
 return <section className="conversation-inbox"><header><div><span className="eyebrow">Spațiul vostru privat</span><h2>Conversații</h2><p>Alege partenera pentru a deschide conversația.</p></div><b aria-label={`${items.length} conversații`}>{items.length}</b></header><div>{items.map(item=><Link href={`/admin/conversatii?id=${encodeURIComponent(item.id)}`} key={item.id}><Image src={`/api/admin/invitatii/${item.id}/photo`} alt="" width={64} height={64} unoptimized/><span><strong>{item.prenume}</strong><small>{item.localitate}, {item.tara}</small><em>{item.lastMessage?item.lastMessage.slice(0,90):item.meetingStatus==="propusa"?"Există o propunere pentru Cafea în Doi":"Conversația este pregătită"}</em>{item.lastActivityAt&&<time>{new Date(item.lastActivityAt).toLocaleString("ro-RO",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</time>}</span><i aria-hidden="true">›</i></Link>)}</div></section>;
}
