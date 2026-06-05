"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/actions/auth";

const initial: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-md border border-line bg-bg px-3 py-2.5 text-ink focus:outline-2 focus:outline-gold"
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p className="rounded-md border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-gold py-2.5 font-semibold text-bg transition-colors hover:bg-gold-soft disabled:opacity-50"
      >
        {pending ? "Accesso…" : "Accedi"}
      </button>
    </form>
  );
}
