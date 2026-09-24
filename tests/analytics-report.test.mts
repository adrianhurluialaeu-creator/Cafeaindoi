import assert from "node:assert/strict";
import test from "node:test";
import {invitationCohort,percentChange,uniqueSessionIds} from "../lib/analytics-report.ts";

test("analytics funnel counts each session once per event",()=>{
 const events=[
  {session_id:"one",event_name:"invitation_started",metadata:{}},
  {session_id:"one",event_name:"invitation_started",metadata:{}},
  {session_id:"two",event_name:"invitation_started",metadata:{}}
 ];
 assert.equal(uniqueSessionIds(events,"invitation_started").size,2);
});

test("analytics cohort links only submitted invitations",()=>{
 const events=[
  {session_id:"one",event_name:"invitation_started",metadata:{invitationId:"ignored"}},
  {session_id:"one",event_name:"invitation_submitted",metadata:{invitationId:"invite-1"}},
  {session_id:"two",event_name:"invitation_submitted",metadata:{}}
 ];
 assert.deepEqual([...invitationCohort(events)],[["invite-1","one"]]);
});

test("analytics comparison handles an empty previous period",()=>{
 assert.equal(percentChange(3,0),100);
 assert.equal(percentChange(0,0),0);
 assert.equal(percentChange(15,10),50);
});
