import { NextRequest, NextResponse } from "next/server";
import { authorized } from "../invitatii/route";
import {
  attachMeetingRoom,
  proposeCoffeeMeeting,
  reactToConversationMessage,
  readConversation,
  respondCoffeeMeeting,
  sendConversationMessage,
} from "../../../../lib/conversation";
import {
  allowConversationMutation,
  trustedConversationOrigin,
} from "../../../../lib/conversation-security";
import { readInvitation } from "../../../../lib/invitations";
import {
  createPrivateRoom,
  createRoomAccess,
  meetingRoomName,
} from "../../../../lib/metered";
import {sendPush} from "../../../../lib/push";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const valid = (id: string | null) => !!id && /^[0-9a-f-]{36}$/i.test(id);
async function target(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!valid(id)) return null;
  const invitation = await readInvitation(id!);
  return invitation ? { id: id!, invitation } : null;
}
export async function GET(req: NextRequest) {
  if (!authorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const row = await target(req);
  return row
    ? NextResponse.json(
        {
          conversationId: row.id,
          conversation: await readConversation(row.id),
        },
        { headers: { "Cache-Control": "private, no-store" } },
      )
    : NextResponse.json({ error: "Invitația nu există." }, { status: 404 });
}
export async function POST(req: NextRequest) {
  if (!authorized(req) || !trustedConversationOrigin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const row = await target(req);
  if (!row || row.invitation.portalAccessStatus !== "active")
    return NextResponse.json(
      { error: "Conversația nu este activă." },
      { status: 404 },
    );
  const limit = await allowConversationMutation(req, `admin:${row.id}`);
  if (!limit.allowed)
    return NextResponse.json(
      { error: "Prea multe acțiuni. Încearcă din nou într-un minut." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  try {
    const body = await req.json();
    if (body.conversationId !== row.id)
      return NextResponse.json(
        { error: "ID-ul conversației nu coincide." },
        { status: 409 },
      );
    const conversation=await sendConversationMessage(
      row.id,
      "adrian",
      String(body.text || ""),
      body.kind,
    );
    try{await sendPush("Mesaj nou de la Adrian",String(body.text||"Ai primit un mesaj nou.").slice(0,120),{url:"/povestea-noastra",tag:`mesaj-${row.id}`,recipient:"partner",invitationId:row.id})}catch(pushError){console.error("[push] PARTNER_MESSAGE_ERROR",pushError)}
    return NextResponse.json({
      conversationId: row.id,
      conversation,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
export async function PATCH(req: NextRequest) {
  if (!authorized(req) || !trustedConversationOrigin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const row = await target(req);
  if (!row || row.invitation.portalAccessStatus !== "active")
    return NextResponse.json(
      { error: "Conversația nu este activă." },
      { status: 404 },
    );
  const limit = await allowConversationMutation(req, `admin:${row.id}`);
  if (!limit.allowed)
    return NextResponse.json(
      { error: "Prea multe acțiuni. Încearcă din nou într-un minut." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  try {
    const body = await req.json();
    if (body.conversationId !== row.id)
      return NextResponse.json(
        { error: "ID-ul conversației nu coincide." },
        { status: 409 },
      );
    if (body.action === "react")
      return NextResponse.json({
        conversationId: row.id,
        conversation: await reactToConversationMessage(
          row.id,
          String(body.messageId || ""),
          "adrian",
          String(body.emoji || ""),
        ),
      });
    if (body.action === "propose"){
      const conversation=await proposeCoffeeMeeting(
        row.id,
        "adrian",
        String(body.startsAt || ""),
        Number(body.plannedMinutes),
      );
      try{await sendPush("Adrian a propus o cafea","Deschide Povestea noastră pentru detalii.",{url:"/povestea-noastra",tag:`cafea-${row.id}`,recipient:"partner",invitationId:row.id})}catch(pushError){console.error("[push] PARTNER_MEETING_ERROR",pushError)}
      return NextResponse.json({
        conversationId: row.id,
        conversation,
      });
    }
    if (body.action === "respond"){
      const conversation=await respondCoffeeMeeting(
        row.id,
        String(body.status || "") as "acceptata" | "refuzata" | "anulata",
      );
      try{await sendPush("Răspuns de la Adrian","Adrian a răspuns propunerii de cafea.",{url:"/povestea-noastra",tag:`raspuns-cafea-${row.id}`,recipient:"partner",invitationId:row.id})}catch(pushError){console.error("[push] PARTNER_MEETING_RESPONSE_ERROR",pushError)}
      return NextResponse.json({
        conversationId: row.id,
        conversation,
      });
    }
    if (body.action === "join") {
      let conversation = await readConversation(row.id);
      if (!conversation?.meeting || conversation.meeting.status !== "acceptata")
        throw new Error("Cafeaua în Doi nu este confirmată.");
      let roomName = conversation.meeting.roomName,
        attach = false;
      if (!roomName) {
        roomName = meetingRoomName(row.id, conversation.meeting.id);
        attach = true;
      }
      await createPrivateRoom(roomName);
      if (attach) conversation = await attachMeetingRoom(row.id, roomName);
      console.info("[metered] JOIN", {
        role: "adrian",
        conversationId: row.id,
        roomName,
      });
      try{await sendPush("Adrian a început apelul video","Intră în Povestea noastră pentru a răspunde.",{url:"/povestea-noastra",tag:`apel-${row.id}`,recipient:"partner",invitationId:row.id})}catch(pushError){console.error("[push] PARTNER_VIDEO_ERROR",pushError)}
      return NextResponse.json({
        conversationId: row.id,
        conversation,
        call: await createRoomAccess(row.id, roomName, "Adrian", true),
      });
    }
    return NextResponse.json({ error: "Acțiune invalidă." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
