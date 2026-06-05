"use client";

import { useActionState } from "react";
import { saveHours } from "@/actions/admin";

export type DayValue = { weekday: number; label: string; value: string };

export function HoursForm({ days }: { days: DayValue[] }) {
  const [state, action, pending] = useActionState(saveHours, {});

  return (
    <form action={action} className="space-y-3">
      <p className="rounded-lg border border-line bg-surface p-3 text-sm text-muted">
        Scrivi le fasce orarie separate da virgola, formato{" "}
        <span className="text-ink">09:00-13:00, 15:00-19:00</span>. Lascia vuoto
        per i giorni di chiusura.
      </p>

      {days.map((d) => (
        <label
          key={d.weekday}
          className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3"
        >
          <span className="w-24 shrink-0 text-sm text-ink">{d.label}</span>
          <input
            name={`day_${d.weekday}`}
            defaultValue={d.value}
            placeholder="Chiuso"
            className="w-full rounded-md border border-line bg-bg px-2.5 py-2 text-sm text-ink focus:outline-2 focus:outline-gold"
          />
        </label>
      ))}

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.ok && <p className="text-sm text-success">Orari salvati.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-gold px-5 py-2.5 font-semibold text-bg hover:bg-gold-soft disabled:opacity-50"
      >
        {pending ? "Salvo…" : "Salva orari"}
      </button>
    </form>
  );
}
