import assert from "node:assert/strict";
import test from "node:test";
import {canOpenConversationStream,validConversationId} from "../lib/realtime-security.ts";

test("realtime stream access stays scoped to role and invitation",()=>{
 const id="11111111-1111-4111-8111-111111111111";
 assert.equal(validConversationId(id),true);
 assert.equal(validConversationId("bad"),false);
 assert.equal(canOpenConversationStream("adrian",id,true,null),true);
 assert.equal(canOpenConversationStream("adrian",id,false,id),false);
 assert.equal(canOpenConversationStream("ea",id,false,id),true);
 assert.equal(canOpenConversationStream("ea",id,false,"22222222-2222-4222-8222-222222222222"),false);
 assert.equal(canOpenConversationStream("other",id,true,id),false);
});
