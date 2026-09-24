import test from "node:test";
import assert from "node:assert/strict";
import {defaultContactSettings,validateContactInput,validateContactSettings} from "../lib/contact-schema.ts";

test("contact form accepts a complete consented message",()=>{const value=validateContactInput({name:"Ana",email:"ANA@example.com",subject:"O întrebare",message:"Acesta este mesajul meu.",consent:true,website:""});assert.ok(value&&!("honeypot" in value));assert.equal(value.email,"ana@example.com")});
test("contact form rejects missing consent and catches bots",()=>{assert.equal(validateContactInput({name:"Ana",email:"ana@example.com",subject:"Salut",message:"Acesta este mesajul meu.",consent:false}),null);assert.deepEqual(validateContactInput({website:"spam.example"}),{honeypot:true})});
test("contact settings allow only valid email and HTTPS social links",()=>{assert.ok(validateContactSettings({...defaultContactSettings,instagram:"https://instagram.com/cafeaindoi"}));assert.equal(validateContactSettings({...defaultContactSettings,email:"invalid"}),null);assert.equal(validateContactSettings({...defaultContactSettings,instagram:"javascript:alert(1)"})?.instagram,"")});
