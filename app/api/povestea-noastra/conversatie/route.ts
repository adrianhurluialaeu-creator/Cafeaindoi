import { cookies } from "next/headers";
import { NextResponse } from "next/server";
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
import {
  PORTAL_COOKIE,
  verifyPortalSession,
} from "../../../../lib/portal-auth";
import {sendPush} from "../../../../lib/push";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function current() {
  return verifyPortalSession((await cookies()).get(PORTAL_COOKIE)?.value);
}
async function identity() {
  const id = await current();
  if (!id) return null;
  const invitation = await readInvitation(id);
  return invitation?.portalAccessStatus === "active"
    ? { id, invitation }
    : null;
}
export async function GET(req: Request) {
  const user = await identity();
  const requestedId = new URL(req.url).searchParams.get("id");
  if (user && requestedId !== user.id)
    return NextResponse.json(
      { error: "ID-ul conversației nu coincide." },
      { status: 409 },
    );
  return user
    ? NextResponse.json(
        {
          conversationId: user.id,
          conversation: await readConversation(user.id),
        },
        { headers: { "Cache-Control": "private, no-store" } },
      )
    : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
export async function POST(req: Request) {
  const user = await identity();
  if (!user || !trustedConversationOrigin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limit = await allowConversationMutation(req, user.id);
  if (!limit.allowed)
    return NextResponse.json(
      { error: "Prea multe acțiuni. Încearcă din nou într-un minut." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  try {
    const body = await req.json();
    if (body.conversationId !== user.id)
      return NextResponse.json(
        { error: "ID-ul conversației nu coincide." },
        { status: 409 },
      );
    const conversation=await sendConversationMessage(
      user.id,
      "ea",
      String(body.text || ""),
      body.kind,
    );
    try{await sendPush(`Mesaj nou de la ${user.invitation.prenume}`,String(body.text||"Ai primit un mesaj nou.").slice(0,120),{url:`/admin/conversatii?id=${encodeURIComponent(user.id)}`,tag:`mesaj-${user.id}`})}catch(pushError){console.error("[push] MESSAGE_ERROR",pushError)}
    return NextResponse.json({
      conversationId: user.id,
      conversation,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
export async function PATCH(req: Request) {
  const user = await identity();
  if (!user || !trustedConversationOrigin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limit = await allowConversationMutation(req, user.id);
  if (!limit.allowed)
    return NextResponse.json(
      { error: "Prea multe acțiuni. Încearcă din nou într-un minut." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  try {
    const body = await req.json();
    if (body.conversationId !== user.id)
      return NextResponse.json(
        { error: "ID-ul conversației nu coincide." },
        { status: 409 },
      );
    if (body.action === "react")
      return NextResponse.json({
        conversationId: user.id,
        conversation: await reactToConversationMessage(
          user.id,
          String(body.messageId || ""),
          "ea",
          String(body.emoji || ""),
        ),
      });
    if (body.action === "propose"){
      const conversation=await proposeCoffeeMeeting(
        user.id,
        "ea",
        String(body.startsAt || ""),
        Number(body.plannedMinutes),
      );
      try{await sendPush("Propunere pentru o cafea",`${user.invitation.prenume} a propus o întâlnire.`,{url:`/admin/conversatii?id=${encodeURIComponent(user.id)}`,tag:`cafea-${user.id}`})}catch(pushError){console.error("[push] MEETING_ERROR",pushError)}
      return NextResponse.json({
        conversationId: user.id,
        conversation,
      });
    }
    if (body.action === "respond"){
      const conversation=await respondCoffeeMeeting(
        user.id,
        String(body.status || "") as "acceptata" | "refuzata" | "anulata",
      );
      try{await sendPush("Răspuns la cafea",`${user.invitation.prenume} a răspuns propunerii de întâlnire.`,{url:`/admin/conversatii?id=${encodeURIComponent(user.id)}`,tag:`raspuns-cafea-${user.id}`})}catch(pushError){console.error("[push] MEETING_RESPONSE_ERROR",pushError)}
      return NextResponse.json({
        conversationId: user.id,
        conversation,
      });
    }
    if (body.action === "join") {
      let conversation = await readConversation(user.id);
      if (!conversation?.meeting || conversation.meeting.status !== "acceptata")
        throw new Error("Cafeaua în Doi nu este confirmată.");
      let roomName = conversation.meeting.roomName,
        attach = false;
      if (!roomName) {
        roomName = meetingRoomName(user.id, conversation.meeting.id);
        attach = true;
      }
      await createPrivateRoom(roomName);
      if (attach) conversation = await attachMeetingRoom(user.id, roomName);
      console.info("[metered] JOIN", {
        role: "partner",
        conversationId: user.id,
        roomName,
      });
      return NextResponse.json({
        conversationId: user.id,
        conversation,
        call: await createRoomAccess(
          user.id,
          roomName,
          user.invitation.prenume,
          false,
        ),
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
