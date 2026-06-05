import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken, type Session } from "./auth";
import { prisma } from "./prisma";

/** Sessione corrente (dal cookie), o null se non autenticato. */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/** Utente loggato completo (dal DB), o null. */
export async function getCurrentUser() {
  const s = await getSession();
  if (!s) return null;
  return prisma.user.findUnique({ where: { id: s.userId } });
}

/** Lancia se non è loggato; restituisce la sessione. */
export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) throw new Error("Non autorizzato");
  return s;
}

/** Lancia se non è il titolare (owner). */
export async function requireOwner(): Promise<Session> {
  const s = await requireSession();
  if (s.role !== "owner") throw new Error("Riservato al titolare");
  return s;
}
