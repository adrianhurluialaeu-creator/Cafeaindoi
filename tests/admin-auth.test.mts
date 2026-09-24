import assert from "node:assert/strict";
import test from "node:test";
import {createAdminSession,validAdminToken} from "../lib/admin-auth.ts";

test("admin session is random, signed and accepted",()=>{
 process.env.ADMIN_SESSION_SECRET="test-secret-only";
 const first=createAdminSession(),second=createAdminSession();
 assert.notEqual(first,second);
 assert.equal(validAdminToken(first),true);
 assert.equal(validAdminToken(second),true);
});

test("tampered admin session is rejected",()=>{
 process.env.ADMIN_SESSION_SECRET="test-secret-only";
 const token=createAdminSession();
 assert.equal(validAdminToken(`${token.slice(0,-1)}x`),false);
 assert.equal(validAdminToken("invalid"),false);
});
