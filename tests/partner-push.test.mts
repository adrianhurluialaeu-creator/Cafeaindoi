import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const read=(path:string)=>readFile(new URL(`../${path}`,import.meta.url),"utf8");

test("abonamentele partenerei sunt legate de sesiunea și invitația ei",async()=>{
 const route=await read("app/api/povestea-noastra/push/route.ts");
 assert.match(route,/verifyPortalSession/);
 assert.match(route,/portalAccessStatus==="active"/);
 assert.match(route,/recipient:"partner",invitationId:user\.id/);
});

test("notificările private sunt trimise numai partenerei conversației",async()=>{
 const route=await read("app/api/admin/conversatie/route.ts");
 assert.match(route,/recipient:"partner",invitationId:row\.id/);
 assert.match(route,/Adrian te sună/);
 const push=await read("lib/push.ts");
 assert.match(push,/sub\.invitationId===target\.invitationId/);
});
