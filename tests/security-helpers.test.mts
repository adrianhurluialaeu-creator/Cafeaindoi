import assert from "node:assert/strict";
import {createHmac} from "node:crypto";
import test from "node:test";
import {validateDeclarationImage} from "../lib/declaration-security.ts";
import {escapeHtml,sanitizeInboundHtml,verifyWebhookSignature} from "../lib/inbound-security.ts";

test("inbound HTML is converted to harmless text",()=>{
 const result=sanitizeInboundHtml('<p>Salut <b>Adrian</b></p><script>alert(1)</script><img src=x onerror=alert(2)><div>&lt;sigur&gt;</div>');
 assert.equal(result,"Salut Adrian\n<sigur>");
 assert.equal(escapeHtml(result),"Salut Adrian\n&lt;sigur&gt;");
});

test("webhook signature accepts fresh payload and rejects replay",()=>{
 const raw='{"type":"email.received"}',now=1_800_000_000_000,timestamp=String(now/1000),id="msg_test",secret=`whsec_${Buffer.from("test-key").toString("base64")}`;
 const digest=createHmac("sha256",Buffer.from("test-key")).update(`${id}.${timestamp}.${raw}`).digest("base64"),headers={id,timestamp,signature:`v1,${digest}`};
 assert.equal(verifyWebhookSignature(raw,headers,secret,now),true);
 assert.equal(verifyWebhookSignature(raw,headers,secret,now+301_000),false);
 assert.equal(verifyWebhookSignature(`${raw}x`,headers,secret,now),false);
});

test("declaration images are restricted to the own HTTPS hosts",()=>{
 assert.equal(validateDeclarationImage(""),"");
 assert.equal(validateDeclarationImage("https://www.cafeaindoi.eu/images/test.jpg"),"https://www.cafeaindoi.eu/images/test.jpg");
 assert.equal(validateDeclarationImage("http://www.cafeaindoi.eu/test.jpg"),null);
 assert.equal(validateDeclarationImage("https://cafeaindoi.eu.evil.example/test.jpg"),null);
 assert.equal(validateDeclarationImage("https://user:pass@cafeaindoi.eu/test.jpg"),null);
});
