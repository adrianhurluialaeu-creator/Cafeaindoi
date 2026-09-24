export type ConversationRole="adrian"|"ea";

export function validConversationId(value:string|null):value is string{
 return !!value&&/^[0-9a-f-]{36}$/i.test(value);
}

export function canOpenConversationStream(role:string|null,id:string,adminAuthorized:boolean,portalInvitationId:string|null){
 if(role!=="adrian"&&role!=="ea")return false;
 return role==="adrian"?adminAuthorized:portalInvitationId===id;
}
