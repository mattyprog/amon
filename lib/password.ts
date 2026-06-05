import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// Hashing delle password con scrypt (incluso in Node, nessuna dipendenza
// nativa). Usato SOLO nelle Server Action (runtime Node), mai nel proxy edge.

const scryptAsync = promisify(scrypt);

/** Crea l'hash di una password: formato "salt:hash" (esadecimale). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

/** Verifica una password contro un hash "salt:hash", a tempo costante. */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const hashBuf = Buffer.from(hash, "hex");
  if (hashBuf.length !== derived.length) return false;
  return timingSafeEqual(hashBuf, derived);
}
