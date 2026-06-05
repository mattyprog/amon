"use client";

import { useActionState } from "react";
import { saveShop } from "@/actions/admin";

export type Field = { key: string; label: string; value: string };

export function ShopForm({ fields }: { fields: Field[] }) {
  const [state, action, pending] = useActionState(saveShop, {});
  return (
    <form action={action} className="space-y-4">
      {fields.map((f) => (
        <label key={f.key} className="block">
          <span className="mb-1 block text-sm text-muted">{f.label}</span>
          <input
            name={f.key}
            defaultValue={f.value}
            className="w-full rounded-md border border-line bg-bg px-3 py-2 text-ink focus:outline-2 focus:outline-gold"
          />
        </label>
      ))}

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.ok && <p className="text-sm text-success">Dati salvati.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-gold px-5 py-2.5 font-semibold text-bg hover:bg-gold-soft disabled:opacity-50"
      >
        {pending ? "Salvo…" : "Salva dati negozio"}
      </button>
    </form>
  );
}
