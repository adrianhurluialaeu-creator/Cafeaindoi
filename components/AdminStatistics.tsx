"use client";
import {useEffect,useMemo,useState} from "react";

type Stats={range:number|"all";analyticsAvailable:boolean;summary:{visitors:number;sessions:number;pageViews:number;invitations:number;activated:number;conversations:number;messages:number;videoCalls:number;conversion:number};deltas:{visitors:number;sessions:number;invitations:number;conversion:number}|null;trend:{date:string;visits:number;invitations:number}[];funnel:{key:string;label:string;value:number}[];sources:{source:string;sessions:number;invitations:number;campaigns:string[];conversion:number}[];pages:{path:string;views:number}[];activity:{messages:number;meetings:number;acceptedMeetings:number;videoCalls:number}};
const ranges=[{value:"7",label:"7 zile"},{value:"30",label:"30 zile"},{value:"90",label:"90 zile"},{value:"all",label:"Tot"}];
const empty="—";
function Delta({value,suffix="%"}:{value?:number;suffix?:string}){if(value===undefined)return null;return <small className={value>0?"positive":value<0?"negative":""}>{value>0?"+":""}{value}{suffix} față de perioada anterioară</small>}
function dateLabel(value:string){return new Intl.DateTimeFormat("ro-RO",{day:"2-digit",month:"short"}).format(new Date(`${value}T12:00:00Z`))}

export default function AdminStatistics(){
 const [days,setDays]=useState("30"),[data,setData]=useState<Stats|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>{const controller=new AbortController();setLoading(true);setError("");fetch(`/api/admin/statistici?days=${days}`,{cache:"no-store",signal:controller.signal}).then(async r=>{const value=await r.json();if(!r.ok)throw new Error(value.error||"Statisticile nu pot fi încărcate.");setData(value)}).catch(err=>{if(err.name!=="AbortError")setError(err.message)}).finally(()=>setLoading(false));return()=>controller.abort()},[days]);
 const maxTrend=useMemo(()=>Math.max(1,...(data?.trend.map(item=>Math.max(item.visits,item.invitations))||[1])),[data]);
 function exportCsv(){if(!data)return;const rows=[["Sursă","Sesiuni","Invitații","Conversie"],...data.sources.map(x=>[x.source,x.sessions,x.invitations,`${x.conversion}%`]),[],["Pagină","Vizualizări"],...data.pages.map(x=>[x.path,x.views])];const csv=rows.map(row=>row.map(cell=>`"${String(cell??"").replaceAll('"','""')}"`).join(",")).join("\n"),url=URL.createObjectURL(new Blob(["\ufeff",csv],{type:"text/csv;charset=utf-8"})),a=document.createElement("a");a.href=url;a.download=`cafeaindoi-statistici-${days}-zile.csv`;a.click();URL.revokeObjectURL(url)}
 return <>
  <section className="stats-toolbar" aria-label="Filtre statistici"><div>{ranges.map(range=><button type="button" key={range.value} className={days===range.value?"active":""} onClick={()=>setDays(range.value)}>{range.label}</button>)}</div><button type="button" className="stats-export" onClick={exportCsv} disabled={!data}>Descarcă CSV</button></section>
  {error?<p className="formerror" role="alert">{error}</p>:null}
  {loading&&!data?<section className="stats-loading">Se încarcă statisticile…</section>:null}
  {data?<>
   {!data.analyticsAvailable?<p className="stats-notice">Colectarea first-party devine activă după aplicarea migrării Supabase. Datele operaționale existente sunt afișate deja.</p>:<p className="stats-notice">Statisticile de trafic includ vizitatorii care și-au dat acordul pentru măsurare. Nu se păstrează IP-ul complet sau datele introduse în formular.</p>}
   <section className="stats-kpis">
    <article><span>Vizitatori</span><strong>{data.summary.visitors}</strong><Delta value={data.deltas?.visitors}/></article>
    <article><span>Sesiuni</span><strong>{data.summary.sessions}</strong><Delta value={data.deltas?.sessions}/></article>
    <article><span>Pagini văzute</span><strong>{data.summary.pageViews}</strong><small>{data.summary.sessions?`${(data.summary.pageViews/data.summary.sessions).toFixed(1)} pagini / sesiune`:empty}</small></article>
    <article><span>Invitații</span><strong>{data.summary.invitations}</strong><Delta value={data.deltas?.invitations}/></article>
    <article><span>Conversie</span><strong>{data.summary.conversion}%</strong><Delta value={data.deltas?.conversion} suffix=" pp"/></article>
    <article><span>Apeluri audio</span><strong>{data.summary.videoCalls}</strong><small>{data.summary.conversations} conversații create</small></article>
   </section>
   <div className="stats-grid stats-grid-main">
    <section className="stats-card stats-chart"><header><div><h2>Trafic și invitații</h2><p>Evoluția zilnică în perioada selectată</p></div><span><i/> Vizite <i/> Invitații</span></header><div className="stats-bars" aria-label="Grafic trafic zilnic">{data.trend.map((item,index)=><div className="stats-day" key={item.date} title={`${dateLabel(item.date)}: ${item.visits} vizite, ${item.invitations} invitații`}><div><i style={{height:`${Math.max(item.visits?5:0,item.visits/maxTrend*100)}%`}}/><b style={{height:`${Math.max(item.invitations?5:0,item.invitations/maxTrend*100)}%`}}/></div>{(data.trend.length<=14||index%Math.ceil(data.trend.length/8)===0)?<small>{dateLabel(item.date)}</small>:<small/>}</div>)}</div></section>
    <section className="stats-card stats-activity"><header><div><h2>Activitate privată</h2><p>După trimiterea invitației</p></div></header><dl><div><dt>Conturi activate</dt><dd>{data.summary.activated}</dd></div><div><dt>Mesaje trimise</dt><dd>{data.activity.messages}</dd></div><div><dt>Întâlniri propuse</dt><dd>{data.activity.meetings}</dd></div><div><dt>Întâlniri acceptate</dt><dd>{data.activity.acceptedMeetings}</dd></div><div><dt>Apeluri audio începute</dt><dd>{data.activity.videoCalls}</dd></div></dl></section>
   </div>
   <section className="stats-card stats-funnel"><header><div><h2>Pâlnia de conversie</h2><p>Vezi exact etapa unde se pierd vizitatorii</p></div></header><div>{data.funnel.map((item,index)=>{const base=data.funnel[0]?.value||0,previous=index?data.funnel[index-1].value:base;return <article key={item.key}><span>{index+1}</span><div><strong>{item.label}</strong><i><b style={{width:`${base?Math.max(item.value/base*100,item.value?4:0):0}%`}}/></i></div><em>{item.value}</em><small>{index===0?"100%":previous?`${Math.round(item.value/previous*100)}% din etapa anterioară`:"0%"}</small></article>})}</div></section>
   <div className="stats-grid">
    <section className="stats-card"><header><div><h2>Surse și campanii</h2><p>De unde vin vizitatorii</p></div></header><div className="stats-table-wrap"><table><thead><tr><th>Sursă</th><th>Sesiuni</th><th>Invitații</th><th>Conversie</th></tr></thead><tbody>{data.sources.length?data.sources.map(row=><tr key={row.source}><td><strong>{row.source}</strong>{row.campaigns.length?<small>{row.campaigns.join(", ")}</small>:null}</td><td>{row.sessions}</td><td>{row.invitations}</td><td>{row.conversion}%</td></tr>):<tr><td colSpan={4}>Nu există încă trafic măsurat.</td></tr>}</tbody></table></div></section>
    <section className="stats-card"><header><div><h2>Pagini populare</h2><p>Conținutul care atrage interesul</p></div></header><ol className="stats-pages">{data.pages.length?data.pages.map(page=><li key={page.path}><span>{page.path}</span><strong>{page.views}</strong></li>):<li><span>Nu există încă vizualizări măsurate.</span></li>}</ol></section>
   </div>
  </>:null}
 </>
}
