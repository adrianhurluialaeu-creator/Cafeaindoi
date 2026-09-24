import assert from "node:assert/strict";
import test from "node:test";
import {createPortalSession,verifyPortalSession} from "../lib/portal-session.ts";

test("portal session is scoped to a valid invitation id",()=>{
 process.env.PORTAL_SESSION_SECRET="portal-test-secret";
 const id="11111111-1111-4111-8111-111111111111",token=createPortalSession(id);
 assert.equal(verifyPortalSession(token),id);
 assert.equal(verifyPortalSession(`${token.slice(0,-1)}x`),null);
 assert.equal(verifyPortalSession(createPortalSession("not-an-id")),null);
});
