"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Challenge, Invitation, JourneyStage } from "../lib/invitations";
import ConversationPanel from "./ConversationPanel";
const stages: JourneyStage[] = [
  "invitatie",
  "online",
  "eu_la_ea",
  "ea_la_mine",
  "experienta",
];
const labels: Record<JourneyStage, string> = {
  invitatie: "Invitație acceptată",
  online: "Ne descoperim online",
  eu_la_ea: "Adrian vine în orașul tău",
  ea_la_mine: "Tu vii în orașul lui",
  experienta: "Prima experiență împreună",
};
export default function OurStoryPortal({ initial }: { initial: Invitation }) {
  const router = useRouter(),
    [row, setRow] = useState(initial),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const stage = row.journeyStage || "invitatie",
    active = stages.indexOf(stage);
  async function action(payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    const r = await fetch("/api/povestea-noastra", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      x = await r.json();
    setBusy(false);
    if (!r.ok) return setError(x.error);
    setRow(x.invitation);
  }
  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget,
      fd = new FormData(form);
    await action({
      action: "add_challenge",
      title: fd.get("title"),
      description: fd.get("description"),
    });
    form.reset();
  }
  async function logout() {
    await fetch("/api/povestea-noastra/login", { method: "DELETE" });
    router.push("/povestea-noastra/login");
    router.refresh();
  }
  return (
    <main className="our-story">
      <header className="our-story-head">
        <div>
          <span className="eyebrow">Cafea în Doi · spațiu privat</span>
          <h1>Povestea noastră</h1>
          <p>
            Bună, {row.prenume}. Aici vă puteți cunoaște pas cu pas, fără grabă.
          </p>
        </div>
        <button onClick={logout}>Ieșire</button>
      </header>
      {error && (
        <p className="formerror" role="alert">
          {error}
        </p>
      )}
      <ol className="portal-timeline">
        {stages.map((item, index) => (
          <li className={index <= active ? "active" : ""} key={item}>
            <b>{index + 1}</b>
            <span>{labels[item]}</span>
          </li>
        ))}
      </ol>
      <ConversationPanel role="ea" invitationId={row.id} partnerName="Adrian" />
      <section className="portal-card">
        <div className="portal-card-head">
          <div>
            <span className="eyebrow">Etapa online</span>
            <h2>Provocările noastre</h2>
          </div>
          <strong>{row.onlineSessions || 0} cafele online</strong>
        </div>
        <p>
          Provocările sunt opționale. Le poți accepta, finaliza sau refuza fără
          să justifici alegerea.
        </p>
        <form className="portal-challenge-form" onSubmit={add}>
          <label>
            Propune-i lui Adrian o provocare
            <input
              name="title"
              maxLength={120}
              required
              placeholder="Ex. Gătim aceeași rețetă"
            />
          </label>
          <label>
            Detalii opționale
            <textarea name="description" maxLength={600} />
          </label>
          <button className="btn" disabled={busy}>
            Trimite provocarea
          </button>
        </form>
        <div className="portal-challenges">
          {(row.challenges || []).length === 0 ? (
            <p>Nu există provocări încă.</p>
          ) : (
            (row.challenges || []).map((item) => (
              <article key={item.id}>
                <span>
                  {item.proposer === "adrian"
                    ? "Propusă de Adrian"
                    : `Propusă de ${row.prenume}`}
                </span>
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
                <div>
                  <StatusButton
                    item={item}
                    status="acceptata"
                    label="Accept"
                    busy={busy}
                    run={action}
                  />
                  <StatusButton
                    item={item}
                    status="finalizata"
                    label="Finalizată"
                    busy={busy}
                    run={action}
                  />
                  <StatusButton
                    item={item}
                    status="refuzata"
                    label="Refuz"
                    busy={busy}
                    run={action}
                  />
                </div>
                <small>Stare: {item.status}</small>
              </article>
            ))
          )}
        </div>
      </section>
      {row.physicalMeeting && (
        <section className="portal-card">
          <span className="eyebrow">Întâlnire fizică</span>
          <h2>
            {row.physicalMeeting.direction === "eu_la_ea"
              ? "Adrian vine în orașul tău"
              : "Tu vii în orașul lui"}
          </h2>
          <p>
            Oraș: <strong>{row.physicalMeeting.city}</strong>
          </p>
          {row.physicalMeeting.dateTime && (
            <p>
              Data:{" "}
              <strong>
                {new Date(row.physicalMeeting.dateTime).toLocaleString("ro-RO")}
              </strong>
            </p>
          )}
          {row.physicalMeeting.locationSharedAt &&
            row.physicalMeeting.place && (
              <div className="portal-location">
                <strong>{row.physicalMeeting.place}</strong>
                <p>{row.physicalMeeting.address}</p>
                {row.physicalMeeting.mapUrl && (
                  <a
                    href={row.physicalMeeting.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Deschide în Google Maps ↗
                  </a>
                )}
              </div>
            )}
          <div className="portal-response">
            <button
              disabled={busy}
              onClick={() =>
                action({ action: "meeting_response", accept: true })
              }
            >
              Confirm întâlnirea
            </button>
            <button
              disabled={busy}
              onClick={() =>
                action({ action: "meeting_response", accept: false })
              }
            >
              Nu doresc
            </button>
          </div>
        </section>
      )}
      {row.sharedExperience && (
        <section className="portal-card">
          <span className="eyebrow">Etapa 5</span>
          <h2>Prima experiență împreună</h2>
          <p>
            <strong>{row.sharedExperience.type}</strong>
            {row.sharedExperience.destination
              ? ` · ${row.sharedExperience.destination}`
              : ""}
          </p>
          {row.sharedExperience.budget && (
            <p>Buget stabilit: {row.sharedExperience.budget}</p>
          )}
          <div className="portal-response">
            <button
              disabled={busy}
              onClick={() =>
                action({ action: "experience_response", accept: true })
              }
            >
              Accept experiența
            </button>
            <button
              disabled={busy}
              onClick={() =>
                action({ action: "experience_response", accept: false })
              }
            >
              Nu doresc
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
function StatusButton({
  item,
  status,
  label,
  busy,
  run,
}: {
  item: Challenge;
  status: Challenge["status"];
  label: string;
  busy: boolean;
  run: (p: Record<string, unknown>) => Promise<void>;
}) {
  return (
    <button
      disabled={busy || item.status === status}
      onClick={() =>
        run({ action: "challenge_status", challengeId: item.id, status })
      }
    >
      {label}
    </button>
  );
}
