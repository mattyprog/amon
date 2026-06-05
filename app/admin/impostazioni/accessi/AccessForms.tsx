"use client";

import { useActionState } from "react";
import { changeOwnPassword, createUser } from "@/actions/admin";

const inputCls =
  "w-full rounded-md border border-line bg-bg px-3 py-2 text-ink focus:outline-2 focus:outline-gold";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changeOwnPassword, {});
  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm text-muted">Password attuale</span>
        <input name="current" type="password" required className={inputCls} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-muted">Nuova password</span>
        <input name="next" type="password" required className={inputCls} />
      </label>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.ok && <p className="text-sm text-success">Password aggiornata.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-gold px-5 py-2.5 font-semibold text-bg hover:bg-gold-soft disabled:opacity-50"
      >
        {pending ? "Salvo…" : "Cambia password"}
      </button>
    </form>
  );
}

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUser, {});
  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Nome</span>
          <input name="name" required className={inputCls} placeholder="Luca" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Nome utente</span>
          <input
            name="username"
            required
            autoCapitalize="none"
            className={inputCls}
            placeholder="luca"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Password</span>
          <input
            name="password"
            type="text"
            required
            className={inputCls}
            placeholder="almeno 6 caratteri"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Ruolo</span>
          <select name="role" className={inputCls} defaultValue="staff">
            <option value="staff">Collaboratore</option>
            <option value="owner">Titolare</option>
          </select>
        </label>
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.ok && <p className="text-sm text-success">Collaboratore aggiunto.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-gold px-5 py-2.5 font-semibold text-bg hover:bg-gold-soft disabled:opacity-50"
      >
        {pending ? "Aggiungo…" : "Aggiungi collaboratore"}
      </button>
    </form>
  );
}
