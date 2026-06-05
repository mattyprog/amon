// Autenticazione del barbiere — leggera ma sicura.
//
// La sessione è un cookie firmato con HMAC-SHA256 tramite la Web Crypto API,
// disponibile sia nel runtime edge (il file `proxy.ts`) sia in Node (le Server
// Action). Nessuna dipendenza esterna. Il cookie contiene solo un ruolo e una
// scadenza: non essendo decifrabile né falsificabile senza il segreto, non
// serve uno store di sessioni lato server.

const ROLE = "barber";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 ore
export const SESSION_COOKIE = "amon_session";

type SessionPayload = { role: string; exp: number };

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET mancante o troppo corto: impostane uno di almeno 16 caratteri in .env.local",
    );
  }
  return secret;
}

// --- Codifica base64url (compatibile edge + node) ---
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

/** Confronto a tempo costante per evitare timing attack. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Crea un token di sessione firmato, valido per le prossime 12 ore. */
export async function createSessionToken(): Promise<string> {
  const payload: SessionPayload = {
    role: ROLE,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = toBase64Url(await hmac(body));
  return `${body}.${sig}`;
}

/** Verifica un token; restituisce true solo se firma e scadenza sono valide. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  try {
    const expected = toBase64Url(await hmac(body));
    if (!timingSafeEqual(sig, expected)) return false;
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(body)),
    ) as SessionPayload;
    return payload.role === ROLE && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

/** Verifica la password del barbiere a tempo costante. */
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD non impostata in .env.local");
  }
  return timingSafeEqual(input, expected);
}

export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;
