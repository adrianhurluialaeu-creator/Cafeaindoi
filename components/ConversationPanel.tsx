"use client";
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { Conversation } from "../lib/conversation";
import {trackAnalytics} from "../lib/analytics-client";
import AudioCall from "./AudioCall";
type Props = {
  role: "adrian" | "ea";
  invitationId?: string;
  partnerName: string;
  onBack?: () => void;
  fullscreen?: boolean;
};
type Kind = "sticker" | "question" | "declaration" | "challenge";
const emojis = [
  "❤️",
  "🥰",
  "😘",
  "😊",
  "😂",
  "😍",
  "🤗",
  "☕",
  "🌹",
  "✨",
  "🙏",
  "👍",
  "💕",
  "💋",
  "🌙",
  "🌞",
];
const stickers = [
  "☕ Bem o cafea?",
  "💭 Mă gândesc la tine",
  "🤗 Îmbrățișare virtuală",
  "😊 Mi-ai făcut ziua mai frumoasă",
  "🌙 Noapte bună",
  "❤️ Mi-e dor de tine",
  "🎉 Provocare acceptată",
  "🌹 Abia aștept să te văd",
];
const questions = [
  "Care a fost cel mai frumos moment al zilei tale?",
  "Ce loc ai vrea să descoperim împreună?",
  "Ce lucru mic te face să zâmbești imediat?",
];

export default function ConversationPanel({
  role,
  invitationId,
  partnerName,
  onBack,
  fullscreen = false,
}: Props) {
  const endpoint =
    role === "adrian"
      ? `/api/admin/conversatie?id=${encodeURIComponent(invitationId || "")}`
      : `/api/povestea-noastra/conversatie?id=${encodeURIComponent(invitationId || "")}`;
  const [conversation, setConversation] = useState<Conversation | null>(null),
    [text, setText] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [callStartKey, setCallStartKey] = useState(0),
    [editMeeting, setEditMeeting] = useState(false),
    [now, setNow] = useState(Date.now()),
    [panel, setPanel] = useState<"plus" | "emoji" | "stickers" | null>(null),
    [selectedMessage, setSelectedMessage] = useState<string | null>(null),
    [callActive, setCallActive] = useState(false),
    [chatOpen, setChatOpen] = useState(true);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const load = useCallback(async () => {
    try {
      const r = await fetch(endpoint, { cache: "no-store" });
      if (r.status === 401) {
        setError("Sesiunea a expirat. Reautentifică-te.");
        return;
      }
      if (!r.ok) throw new Error();
      const data = await r.json();
      if (!invitationId || data.conversationId !== invitationId)
        throw new Error("CONVERSATION_ID_MISMATCH");
      setConversation(data.conversation);
    } catch {
      setError(
        (previous) =>
          previous || "Conversația nu poate fi actualizată momentan.",
      );
    }
  }, [endpoint]);
  useEffect(() => {
    void load();
    const stream = invitationId
      ? new EventSource(`/api/realtime/conversatie?id=${encodeURIComponent(invitationId)}&role=${role}`)
      : null;
    stream?.addEventListener("changed", () => void load());
    const fallback = window.setInterval(() => {
        if (document.visibilityState === "visible") void load();
      }, 60000),
      clock = window.setInterval(() => setNow(Date.now()), 60000);
    const visible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.clearInterval(fallback);
      window.clearInterval(clock);
      document.removeEventListener("visibilitychange", visible);
      stream?.close();
    };
  }, [invitationId, load, role]);
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ block: "end" });
  }, [conversation?.messages.length]);
  async function request(
    method: "POST" | "PATCH",
    body: Record<string, unknown>,
  ) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, conversationId: invitationId }),
        }),
        data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error || "Acțiunea nu a reușit.");
        return null;
      }
      if (data.conversation) setConversation(data.conversation);
      return data;
    } catch {
      setError("Conexiunea s-a întrerupt. Încearcă din nou.");
      return null;
    } finally {
      setBusy(false);
    }
  }
  async function send(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const sent = await request("POST", { text });
    if (sent) setText("");
  }
  async function sendSpecial(value: string, kind: Kind) {
    const sent = await request("POST", { text: value, kind });
    if (sent) setPanel(null);
  }
  async function propose(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget),
      data = await request("PATCH", {
        action: "propose",
        startsAt: fd.get("startsAt"),
        plannedMinutes: Number(fd.get("plannedMinutes")),
      });
    if (data) setEditMeeting(false);
  }
  function join(){trackAnalytics("video_call_started",{role,invitationId:invitationId||""});setCallStartKey(value=>value+1)}
  const meeting = conversation?.meeting,
    remaining = conversation?.expiresAt
      ? Math.max(0, Date.parse(conversation.expiresAt) - now)
      : 0,
    hours = Math.floor(remaining / 3600000),
    minutes = Math.floor((remaining % 3600000) / 60000),
    adrianPhoto = "/images/ChatGPT Image 20 sept. 2026, 20_47_04.webp",
    guestPhoto =
      role === "adrian" && invitationId
        ? `/api/admin/invitatii/${invitationId}/photo`
        : "/images/cafeaindoi-icon.webp";
  function avatar(sender: "adrian" | "ea") {
    return sender === "adrian" ? adrianPhoto : guestPhoto;
  }
  return (
    <section
      className={`conversation-card conversation-preview ${fullscreen ? "is-fullscreen" : ""} ${callActive ? "is-in-call" : ""} ${callActive&&!chatOpen ? "is-chat-hidden" : ""}`}
    >
      <header className="conversation-head">
        {onBack ? (
          <button
            className="conversation-back"
            onClick={onBack}
            aria-label="Înapoi la conversații"
          >
            ‹
          </button>
        ) : (
          <span />
        )}
        <div className="conversation-person">
          <Image
            src={avatar(role === "adrian" ? "ea" : "adrian")}
            alt=""
            width={58}
            height={58}
            unoptimized
          />
          <div>
            <h2>{callActive ? "Chat" : "Conversația noastră"}</h2>
            <span>🔒 Doar voi doi · {partnerName}</span>
          </div>
        </div>
        <button
          className="conversation-video-icon"
          onClick={
            meeting?.status === "acceptata" ? join : () => setEditMeeting(true)
          }
          aria-label="Propune sau începe un apel video"
        >
          <PhoneGlyph />
        </button>
      </header>
      <p className="conversation-retention">
        ◷ <strong>Mesajele se șterg automat la 24h după ultimul mesaj</strong>
      </p>
      {error && (
        <p className="formerror" role="alert">
          {error}
        </p>
      )}
      <div className="conversation-messages" aria-live="polite">
        {!conversation?.messages.length ? (
          <p className="conversation-empty">
            Începeți firesc — poate chiar cu invitația la o cafea.
          </p>
        ) : (
          conversation.messages.map((message) => (
            <div
              className={`message-row ${message.sender === role ? "mine" : "theirs"} ${message.kind === "sticker" ? "is-sticker" : ""}`}
              key={message.id}
            >
              <Image
                src={avatar(message.sender)}
                alt=""
                width={42}
                height={42}
                unoptimized
              />
              <article>
                <p>{message.text}</p>
                {message.reactions?.length ? (
                  <span className="message-reactions">
                    {message.reactions.map((item, index) => (
                      <b key={`${item.sender}-${index}`}>{item.emoji}</b>
                    ))}
                  </span>
                ) : null}
                <div className="message-meta">
                  <time>
                    {new Date(message.createdAt).toLocaleTimeString("ro-RO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {message.sender === role && " · trimis"}
                  </time>
                  <button
                    type="button"
                    aria-label="Reacționează la mesaj"
                    aria-expanded={selectedMessage === message.id}
                    onClick={() =>
                      setSelectedMessage(
                        selectedMessage === message.id ? null : message.id,
                      )
                    }
                  >
                    ♡
                  </button>
                </div>
                {selectedMessage === message.id && (
                  <div
                    className="reaction-picker"
                    role="group"
                    aria-label="Alege reacția"
                  >
                    {["❤️", "😂", "🥰", "👍", "😮", "😔"].map((emoji) => (
                      <button
                        type="button"
                        aria-label={`Reacție ${emoji}`}
                        key={emoji}
                        onClick={() => {
                          void request("PATCH", {
                            action: "react",
                            messageId: message.id,
                            emoji,
                          });
                          setSelectedMessage(null);
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            </div>
          ))
        )}
        <div ref={messagesEnd} />
      </div>
      {meeting && !editMeeting ? (
        <div className="coffee-call">
          <div className="coffee-call-title">
            <span>
              <PhoneGlyph />
            </span>
            <div>
              <b>
                {meeting.status === "propusa"
                  ? "Apel video propus"
                  : "O Cafea în Doi"}
              </b>
              <small>
                {new Date(meeting.startsAt).toLocaleString("ro-RO", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · aproximativ {meeting.plannedMinutes} min
              </small>
            </div>
          </div>
          {meeting.status === "propusa" && meeting.proposer !== role && (
            <div className="coffee-actions">
              <button
                onClick={() =>
                  void request("PATCH", {
                    action: "respond",
                    status: "acceptata",
                  })
                }
                disabled={busy}
              >
                Acceptă
              </button>
              <button className="ghost" onClick={() => setEditMeeting(true)}>
                Propune altă oră
              </button>
            </div>
          )}
          {meeting.status === "propusa" && meeting.proposer === role && (
            <p className="coffee-waiting">
              Așteptăm răspunsul lui {partnerName}.
            </p>
          )}
          {meeting.status === "acceptata" && (
            <button className="coffee-start" onClick={join} disabled={busy}>
              <PhoneGlyph /> Sună
            </button>
          )}
          {meeting.status === "refuzata" && (
            <p className="coffee-waiting">
              Propunerea nu a fost acceptată. Puteți alege alt moment.
            </p>
          )}
          <small className="coffee-note">
            ⓘ Durata este orientativă. Apelul nu se închide automat.
          </small>
        </div>
      ) : editMeeting ? (
        <MeetingForm
          propose={propose}
          busy={busy}
          cancel={meeting ? () => setEditMeeting(false) : undefined}
        />
      ) : null}
      {conversation?.expiresAt && (
        <div className="conversation-expiry">
          <span />
          <p>
            ◷ Mesajele expiră peste{" "}
            <strong>
              {hours}h {minutes}min
            </strong>
          </p>
          <span />
        </div>
      )}
      {meeting?.status === "acceptata" && (
        <button
          className="conversation-main-call"
          onClick={join}
          disabled={busy}
        >
          <PhoneGlyph /> Sună
        </button>
      )}
      {panel && (
        <ComposerPanel
          panel={panel}
          close={() => setPanel(null)}
          chooseEmoji={(emoji) => {
            setText((value) => value + emoji);
            setPanel(null);
          }}
          sendSpecial={sendSpecial}
          openMeeting={() => {
            setEditMeeting(true);
            setPanel(null);
          }}
          openStickers={() => setPanel("stickers")}
        />
      )}
      <form className="conversation-compose" onSubmit={send}>
        <button
          type="button"
          className="compose-plus"
          aria-label="Mai multe opțiuni"
          aria-expanded={panel === "plus"}
          onClick={() => setPanel(panel === "plus" ? null : "plus")}
        >
          +
        </button>
        <button
          type="button"
          className="compose-emoji"
          aria-label="Alege un emoji"
          aria-expanded={panel === "emoji"}
          onClick={() => setPanel(panel === "emoji" ? null : "emoji")}
        >
          😊
        </button>
        <label className="sr-only" htmlFor={`message-${role}`}>
          Mesaj
        </label>
        <textarea
          id={`message-${role}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          placeholder="Scrie un mesaj…"
          required
        />
        <button
          className="compose-send"
          disabled={busy || !text.trim()}
          aria-label="Trimite mesajul"
        >
          ➤
        </button>
      </form>
      <AudioCall endpoint={endpoint} role={role} partnerName={partnerName} startKey={callStartKey} chatOpen={chatOpen} onToggleChat={()=>setChatOpen(value=>!value)} onActiveChange={setCallActive}/>
    </section>
  );
}

function ComposerPanel({
  panel,
  close,
  chooseEmoji,
  sendSpecial,
  openMeeting,
  openStickers,
}: {
  panel: "plus" | "emoji" | "stickers";
  close: () => void;
  chooseEmoji: (e: string) => void;
  sendSpecial: (v: string, k: Kind) => void;
  openMeeting: () => void;
  openStickers: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeButton.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [close]);
  return (
    <div
      className="composer-panel"
      role="dialog"
      aria-modal="false"
      aria-label={
        panel === "emoji"
          ? "Emoji"
          : panel === "stickers"
            ? "Stickere"
            : "Adaugă în conversație"
      }
    >
      <header>
        <strong>
          {panel === "emoji"
            ? "Emoji"
            : panel === "stickers"
              ? "Stickere Cafea în Doi"
              : "Adaugă în conversație"}
        </strong>
        <button ref={closeButton} onClick={close} aria-label="Închide">
          ×
        </button>
      </header>
      {panel === "emoji" && (
        <div className="emoji-grid">
          {emojis.map((e) => (
            <button
              aria-label={`Emoji ${e}`}
              key={e}
              onClick={() => chooseEmoji(e)}
            >
              {e}
            </button>
          ))}
        </div>
      )}
      {panel === "stickers" && (
        <div className="sticker-grid">
          {stickers.map((s) => (
            <button key={s} onClick={() => void sendSpecial(s, "sticker")}>
              {s}
            </button>
          ))}
        </div>
      )}
      {panel === "plus" && (
        <div className="plus-grid">
          <button onClick={openMeeting}>
            📹<span>Apel video</span>
          </button>
          <button onClick={openStickers}>
            💟<span>Sticker</span>
          </button>
          <button
            onClick={() =>
              void sendSpecial(
                questions[Math.floor(Math.random() * questions.length)],
                "question",
              )
            }
          >
            ❓<span>Întrebare</span>
          </button>
          <button
            onClick={() =>
              void sendSpecial(
                "Provocare pentru noi doi: alegem fiecare câte un cântec care ne reprezintă.",
                "challenge",
              )
            }
          >
            🎯<span>Provocare</span>
          </button>
          <button
            onClick={() =>
              void sendSpecial(
                "Îmi place că ne descoperim fără grabă. Fiecare conversație cu tine îmi face ziua mai frumoasă. ❤️",
                "declaration",
              )
            }
          >
            💌<span>Declarație</span>
          </button>
          <button disabled title="În curând">
            📷<span>Foto / voce · în curând</span>
          </button>
        </div>
      )}
    </div>
  );
}
function MeetingForm({
  propose,
  busy,
  cancel,
}: {
  propose: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  busy: boolean;
  cancel?: () => void;
}) {
  const minimum = new Date(Date.now() + 5 * 60_000);
  minimum.setMinutes(minimum.getMinutes() - minimum.getTimezoneOffset());
  return (
    <form className="coffee-propose" onSubmit={propose}>
      <strong>Propune un apel video</strong>
      <label>
        Data și ora
        <input
          name="startsAt"
          type="datetime-local"
          min={minimum.toISOString().slice(0, 16)}
          required
        />
      </label>
      <label>
        Durată orientativă
        <select name="plannedMinutes" defaultValue="30">
          <option value="15">15 minute</option>
          <option value="30">30 minute</option>
          <option value="60">60 minute</option>
          <option value="90">90 minute</option>
        </select>
      </label>
      <div>
        {cancel && (
          <button type="button" className="ghost" onClick={cancel}>
            Renunță
          </button>
        )}
        <button disabled={busy}>Trimite propunerea</button>
      </div>
      <small>
        Ora este afișată în fusul orar al telefonului. Apelul poate continua
        oricât doriți.
      </small>
    </form>
  );
}
function PhoneGlyph(){return <span className="phone-glyph" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="13" height="12" rx="3"/><path d="m16 10 5-3v10l-5-3z"/></svg></span>}
