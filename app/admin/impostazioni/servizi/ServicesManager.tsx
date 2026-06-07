"use client";

import { useActionState } from "react";
import { saveService, deleteService } from "@/actions/admin";
import { ConfirmButton } from "../../ConfirmButton";
import type { Service } from "@/lib/config";

const inputCls =
  "w-full rounded-md border border-line bg-bg px-2.5 py-2 text-sm text-ink focus:outline-2 focus:outline-gold";

function ServiceForm({ service }: { service?: Service }) {
  const [state, action, pending] = useActionState(saveService, {});
  const isNew = !service;
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <form action={action}>
      {service && <input type="hidden" name="id" value={service.id} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Nome</span>
          <input
            name="name"
            defaultValue={service?.name}
            required
            className={inputCls}
            placeholder="Taglio"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Durata (min)</span>
          <input
            name="durationMin"
            type="number"
            min={5}
            step={5}
            defaultValue={service?.durationMin ?? 30}
            required
            className={`${inputCls} sm:w-28`}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted">Prezzo (€)</span>
          <input
            name="priceEuro"
            type="number"
            min={0}
            step="0.5"
            defaultValue={
              service ? (service.priceCents / 100).toString() : "20"
            }
            required
            className={`${inputCls} sm:w-28`}
          />
        </label>
      </div>
      <label className="mt-3 block">
        <span className="mb-1 block text-xs text-muted">Descrizione</span>
        <input
          name="description"
          defaultValue={service?.description}
          className={inputCls}
          placeholder="Taglio classico o moderno, lavaggio e styling."
        />
      </label>

      {state.error && (
        <p className="mt-2 text-sm text-danger">{state.error}</p>
      )}
      {state.ok && !isNew && (
        <p className="mt-2 text-sm text-success">Salvato.</p>
      )}

      <div className="mt-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-bg hover:bg-gold-soft disabled:opacity-50"
        >
          {pending ? "Salvo…" : isNew ? "Aggiungi servizio" : "Salva"}
        </button>
      </div>
      </form>

      {/* Form separato (non annidato) per l'eliminazione */}
      {service && (
        <form action={deleteService} className="mt-3 border-t border-line/70 pt-3">
          <input type="hidden" name="id" value={service.id} />
          <ConfirmButton
            confirm={`Eliminare il servizio "${service.name}"?`}
            className="text-sm text-muted transition-colors hover:text-danger"
          >
            Elimina servizio
          </ConfirmButton>
        </form>
      )}
    </div>
  );
}

export function ServicesManager({ services }: { services: Service[] }) {
  return (
    <div className="space-y-4">
      {services.map((s) => (
        <ServiceForm key={s.id} service={s} />
      ))}
      <div>
        <h2 className="signage mb-2 mt-8 text-base text-muted">
          Nuovo servizio
        </h2>
        <ServiceForm />
      </div>
    </div>
  );
}
