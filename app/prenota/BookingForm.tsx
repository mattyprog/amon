"use client";

import { useEffect, useState, useTransition } from "react";
import { fetchSlots, createBooking, type BookingResult } from "@/actions/booking";
import { formatPrice, type Service } from "@/lib/config";
import { minutesToHHMM, formatDateLabel } from "@/lib/time";

export type DayOption = { date: string; label: string };

function StepBadge({ n, label }: { n: number; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="grid h-7 w-7 place-items-center rounded-full border border-gold/60 text-sm text-gold">
        {n}
      </span>
      <h2 className="signage text-lg text-ink">{label}</h2>
    </div>
  );
}

export function BookingForm({
  services,
  days,
  initialServiceId,
}: {
  services: Service[];
  days: DayOption[];
  initialServiceId: string;
}) {
  const [serviceId, setServiceId] = useState(initialServiceId);
  const [date, setDate] = useState<string>("");
  const [startMin, setStartMin] = useState<number | null>(null);
  const [slots, setSlots] = useState<number[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);
  const [pending, startTransition] = useTransition();

  const service = services.find((s) => s.id === serviceId)!;

  // Quando cambia servizio o giorno, ricarica gli slot disponibili.
  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }
    let active = true;
    setLoadingSlots(true);
    setStartMin(null);
    fetchSlots(serviceId, date)
      .then((s) => {
        if (active) setSlots(s);
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });
    return () => {
      active = false;
    };
  }, [serviceId, date]);

  function handleSubmit(formData: FormData) {
    setError(null);
    if (startMin === null) {
      setError("Seleziona un orario.");
      return;
    }
    formData.set("serviceId", serviceId);
    formData.set("date", date);
    formData.set("startMin", String(startMin));
    startTransition(async () => {
      const res = await createBooking(formData);
      if (res.ok) {
        setResult(res);
      } else {
        setError(res.error);
        // Lo slot potrebbe essersi occupato: ricarica la disponibilità.
        if (date) {
          const fresh = await fetchSlots(serviceId, date);
          setSlots(fresh);
          setStartMin(null);
        }
      }
    });
  }

  // --- Schermata di conferma ---
  if (result?.ok) {
    const a = result.appointment;
    return (
      <div className="rounded-lg border border-success/40 bg-success/5 p-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-success text-2xl text-success">
          ✓
        </div>
        <h2 className="font-display text-3xl text-ink">Prenotazione confermata</h2>
        <p className="mt-3 text-muted">Ti aspettiamo! Ecco il riepilogo:</p>
        <div className="mx-auto mt-6 max-w-xs space-y-2 rounded-md border border-line bg-surface p-5 text-left text-sm">
          <Row label="Servizio" value={a.serviceName} />
          <Row label="Giorno" value={formatDateLabel(a.date)} />
          <Row
            label="Orario"
            value={`${minutesToHHMM(a.startMin)} – ${minutesToHHMM(a.endMin)}`}
          />
        </div>
        <a
          href="/"
          className="mt-8 inline-block rounded-sm bg-gold px-6 py-3 font-semibold text-bg transition-colors hover:bg-gold-soft"
        >
          Torna alla home
        </a>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-10">
      {/* 1. Servizio */}
      <section>
        <StepBadge n={1} label="Scegli il servizio" />
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => {
            const active = s.id === serviceId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setServiceId(s.id)}
                className={`flex items-center justify-between rounded-md border p-4 text-left transition-colors ${
                  active
                    ? "border-gold bg-gold/10"
                    : "border-line bg-surface hover:border-gold/50"
                }`}
              >
                <span>
                  <span className="block font-semibold text-ink">{s.name}</span>
                  <span className="block text-xs text-muted">
                    {s.durationMin} min
                  </span>
                </span>
                <span className="font-display text-lg text-gold">
                  {formatPrice(s.priceCents)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Giorno */}
      <section>
        <StepBadge n={2} label="Scegli il giorno" />
        {days.length === 0 ? (
          <p className="text-muted">Nessun giorno disponibile al momento.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {days.map((d) => {
              const active = d.date === date;
              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setDate(d.date)}
                  className={`rounded-sm border px-3 py-2 text-sm capitalize transition-colors ${
                    active
                      ? "border-gold bg-gold text-bg"
                      : "border-line bg-surface text-ink hover:border-gold/50"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Orario */}
      <section>
        <StepBadge n={3} label="Scegli l'orario" />
        {!date ? (
          <p className="text-muted">Seleziona prima un giorno.</p>
        ) : loadingSlots ? (
          <p className="text-muted">Carico gli orari disponibili…</p>
        ) : slots.length === 0 ? (
          <p className="text-muted">
            Nessun orario libero in questo giorno. Prova con un altro.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {slots.map((min) => {
              const active = min === startMin;
              return (
                <button
                  key={min}
                  type="button"
                  onClick={() => setStartMin(min)}
                  className={`rounded-sm border py-2 text-sm transition-colors ${
                    active
                      ? "border-gold bg-gold text-bg"
                      : "border-line bg-surface text-ink hover:border-gold/50"
                  }`}
                >
                  {minutesToHHMM(min)}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Dati cliente */}
      <section>
        <StepBadge n={4} label="I tuoi dati" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome e cognome" required>
            <input
              name="name"
              required
              autoComplete="name"
              className="input"
              placeholder="Mario Rossi"
            />
          </Field>
          <Field label="Telefono" required>
            <input
              name="phone"
              required
              inputMode="tel"
              autoComplete="tel"
              className="input"
              placeholder="351 000 0000"
            />
          </Field>
          <Field label="Email (facoltativa)">
            <input
              name="email"
              type="email"
              autoComplete="email"
              className="input"
              placeholder="mario@email.it"
            />
          </Field>
          <Field label="Note (facoltative)">
            <input
              name="notes"
              className="input"
              placeholder="Es. taglio sfumato basso"
            />
          </Field>
        </div>
      </section>

      {error && (
        <p className="rounded-md border border-danger/50 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {/* Riepilogo + invio */}
      <div className="flex flex-col gap-4 rounded-md border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {service.name} · {service.durationMin} min ·{" "}
          <span className="text-gold">{formatPrice(service.priceCents)}</span>
          {date && startMin !== null && (
            <>
              {" "}
              · {formatDateLabel(date)} alle {minutesToHHMM(startMin)}
            </>
          )}
        </p>
        <button
          type="submit"
          disabled={pending || startMin === null}
          className="rounded-sm bg-gold px-7 py-3 font-semibold text-bg transition-colors hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Confermo…" : "Conferma prenotazione"}
        </button>
      </div>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid var(--color-line);
          background: var(--color-bg);
          padding: 0.625rem 0.75rem;
          color: var(--color-ink);
          font-size: 0.95rem;
        }
        .input::placeholder { color: color-mix(in srgb, var(--color-muted) 70%, transparent); }
        .input:focus { outline: 2px solid var(--color-gold); outline-offset: 1px; }
      `}</style>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="text-right text-ink">{value}</span>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">
        {label}
        {required && <span className="text-gold"> *</span>}
      </span>
      {children}
    </label>
  );
}
