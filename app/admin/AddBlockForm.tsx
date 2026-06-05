"use client";

import { useActionState, useEffect, useRef } from "react";
import { addBlock } from "@/actions/admin";

export function AddBlockForm({ date }: { date: string }) {
  const [state, formAction, pending] = useActionState(addBlock, {});
  const formRef = useRef<HTMLFormElement>(null);

  // Pulisci il form dopo un inserimento riuscito (nessun errore di ritorno).
  useEffect(() => {
    if (!pending && state && !state.error) {
      // resettiamo solo gli orari/motivo, mantenendo la data corrente
      formRef.current?.querySelectorAll<HTMLInputElement>(
        "input[name='reason']",
      )[0]?.setAttribute("value", "");
    }
  }, [state, pending]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="date" value={date} />
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Dalle</span>
          <input
            type="time"
            name="start"
            required
            defaultValue="13:00"
            className="w-full rounded-md border border-line bg-bg px-2 py-2 text-ink [color-scheme:dark]"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Alle</span>
          <input
            type="time"
            name="end"
            required
            defaultValue="15:00"
            className="w-full rounded-md border border-line bg-bg px-2 py-2 text-ink [color-scheme:dark]"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Motivo (facoltativo)</span>
        <input
          name="reason"
          placeholder="Pausa, ferie, impegno…"
          className="w-full rounded-md border border-line bg-bg px-2 py-2 text-ink"
        />
      </label>

      {state?.error && (
        <p className="rounded-md border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md border border-gold/60 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-bg disabled:opacity-50"
      >
        {pending ? "Aggiungo…" : "Blocca orario"}
      </button>
    </form>
  );
}
