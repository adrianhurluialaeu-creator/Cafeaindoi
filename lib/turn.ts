export type TurnIceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

const fallbackIceServers: TurnIceServer[] = [
  { urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] },
];

function validIceServers(value: unknown): value is TurnIceServer[] {
  return Array.isArray(value) && value.length > 0 && value.every((server) => {
    if (!server || typeof server !== "object") return false;
    const candidate = server as Record<string, unknown>;
    const urls = candidate.urls;
    return typeof urls === "string" || (Array.isArray(urls) && urls.every((url) => typeof url === "string"));
  });
}

export async function createTurnIceServers() {
  const keyId = process.env.CLOUDFLARE_TURN_KEY_ID?.trim();
  const apiToken = process.env.CLOUDFLARE_TURN_API_TOKEN?.trim();

  if (!keyId || !apiToken) {
    return { iceServers: fallbackIceServers, turnEnabled: false };
  }

  const response = await fetch(
    `https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(keyId)}/credentials/generate-ice-servers`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl: 3600 }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    },
  );

  if (!response.ok) throw new Error("Serviciul TURN nu a putut genera datele de conectare.");
  const data = (await response.json()) as { iceServers?: unknown };
  if (!validIceServers(data.iceServers)) throw new Error("Serviciul TURN a răspuns incorect.");

  return { iceServers: data.iceServers, turnEnabled: true };
}
