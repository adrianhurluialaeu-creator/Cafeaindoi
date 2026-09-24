import assert from "node:assert/strict";
import test from "node:test";
import {hashAdminPassword,verifyAdminPassword} from "../lib/admin-password.ts";

test("parola administratorului este stocată ca hash scrypt",async()=>{const password="O-parola-lunga-si-sigura!",hash=await hashAdminPassword(password);assert.notEqual(hash,password);assert.match(hash,/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/);assert.equal(await verifyAdminPassword(password,hash),true);assert.equal(await verifyAdminPassword("parola-gresita",hash),false)});

test("hashurile invalide sunt respinse",async()=>{assert.equal(await verifyAdminPassword("orice","text-simplu"),false);assert.equal(await verifyAdminPassword("orice","scrypt$invalid$invalid"),false)});
