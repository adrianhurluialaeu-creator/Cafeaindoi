import assert from "node:assert/strict";
import test from "node:test";
import {defaultAdminSettings,mergeAdminSettings,validateSettingsSection} from "../lib/admin-settings-schema.ts";

test("admin settings merge stored values with safe defaults",()=>{
 const merged=mergeAdminSettings({invitations:{enabled:false}});
 assert.equal(merged.invitations.enabled,false);
 assert.equal(merged.invitations.minAge,18);
 assert.equal(merged.general.siteName,"Cafea în Doi");
});

test("admin settings reject invalid limits and email",()=>{
 assert.equal(validateSettingsSection("invitations",{...defaultAdminSettings.invitations,dailyLimit:0}),null);
 assert.equal(validateSettingsSection("general",{...defaultAdminSettings.general,contactEmail:"invalid"}),null);
});

test("admin settings accept every supported section",()=>{
 for(const section of ["general","invitations","privateSpace","notifications","privacy"] as const)assert.ok(validateSettingsSection(section,defaultAdminSettings[section]));
});
