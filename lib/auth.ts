// Sessione del barbiere — firmata con HMAC-SHA256 via Web Crypto, così la
// stessa verifica funziona nel runtime edge (proxy.ts) e in Node (le Server
// Action). Il cookie contiene id utente, ruolo e scadenza: firmato, non è
// falsificabile senza il segreto. L'hashing delle password è in lib/password.ts
// (runtime Node) per non trascinare node:crypto nel bundle edge.

const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 ore
export const SESSION_COOKIE = "amon_session";

export type Session = { userId: string; role: string; exp: number };

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET mancante o troppo corto: impostane uno di almeno 16 caratteri.",
    );
  }
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmac(data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Crea un token di sessione firmato per un utente, valido 12 ore. */
export async function createSessionToken(
  userId: string,
  role: string,
): Promise<string> {
  const payload: Session = {
    userId,
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = toBase64Url(await hmac(body));
  return `${body}.${sig}`;
}

/** Verifica un token; restituisce la sessione se valida, altrimenti null. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<Session | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const expected = toBase64Url(await hmac(body));
    if (!timingSafeEqual(sig, expected)) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(body)),
    ) as Session;
    if (!payload.userId || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;
