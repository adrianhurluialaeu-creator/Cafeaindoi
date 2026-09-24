export type AnalyticsEventRow={
 session_id:string;
 event_name:string;
 metadata?:Record<string,unknown>|null;
};

export function uniqueSessionIds(events:AnalyticsEventRow[],eventName:string){
 return new Set(events.filter(event=>event.event_name===eventName).map(event=>event.session_id));
}

export function invitationCohort(events:AnalyticsEventRow[]){
 const result=new Map<string,string>();
 for(const event of events){
  if(event.event_name!=="invitation_submitted")continue;
  const invitationId=event.metadata?.invitationId;
  if(typeof invitationId==="string"&&invitationId)result.set(invitationId,event.session_id);
 }
 return result;
}

export function percentChange(current:number,previous:number){
 if(!previous)return current?100:0;
 return Math.round((current-previous)/previous*100);
}
