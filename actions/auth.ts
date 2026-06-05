"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
} from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export type LoginState = { error?: string };

/** Login: verifica username + password e imposta il cookie di sessione. */
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // Al primo accesso in assoluto crea l'utente titolare dai default.
  await ensureSeeded();

  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Inserisci nome utente e password." };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  // Confronto anche in assenza dell'utente per non rivelare quali esistono.
  const ok = user
    ? await verifyPassword(password, user.passwordHash)
    : await verifyPassword(password, "x:0000");

  if (!user || !ok) {
    return { error: "Credenziali errate." };
  }

  const token = await createSessionToken(user.id, user.role);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/admin");
}

/** Logout: cancella il cookie di sessione. */
export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
