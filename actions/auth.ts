"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  checkPassword,
  createSessionToken,
} from "@/lib/auth";

export type LoginState = { error?: string };

/** Login del barbiere: verifica la password e imposta il cookie di sessione. */
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!password || !checkPassword(password)) {
    return { error: "Password errata." };
  }

  const token = await createSessionToken();
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
