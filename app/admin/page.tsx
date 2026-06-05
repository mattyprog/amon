import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { logout } from "@/actions/auth";
import { cancelAppointment, removeBlock } from "@/actions/admin";
import { formatPrice, shop } from "@/lib/shop";
import {
  todayInShop,
  addDays,
  minutesToHHMM,
  formatDateLabel,
  monthGrid,
} from "@/lib/time";
import { Logo } from "@/components/Logo";
import { MonthCalendar } from "./MonthCalendar";
import { AddBlockForm } from "./AddBlockForm";
import { ConfirmButton } from "./ConfirmButton";

export const metadata: Metadata = {
  title: "Agenda",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const today = todayInShop();
  const date =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : today;

  // Finestra di 42 giorni mostrata dal calendario, per i badge di conteggio.
  const grid = monthGrid(date);
  const gridStart = grid[0];
  const gridEnd = grid[grid.length - 1];

  const [appointments, blocks, monthRows] = await Promise.all([
    prisma.appointment.findMany({
      where: { date, status: "confirmed" },
      orderBy: { startMin: "asc" },
    }),
    prisma.block.findMany({
      where: { date },
      orderBy: { startMin: "asc" },
    }),
    prisma.appointment.findMany({
      where: { status: "confirmed", date: { gte: gridStart, lte: gridEnd } },
      select: { date: true },
    }),
  ]);

  const counts: Record<string, number> = {};
  for (const r of monthRows) counts[r.date] = (counts[r.date] ?? 0) + 1;

  const revenue = appointments.reduce((sum, a) => sum + a.priceCents, 0);
  const isToday = date === today;

  return (
    <div className="min-h-screen pb-10">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-5">
          <Logo href="/admin" />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="hidden text-sm text-muted underline-offset-4 hover:text-ink hover:underline sm:inline"
            >
              Vedi sito
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:border-danger hover:text-danger"
              >
                Esci
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-5">
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Colonna calendario + statistiche */}
          <div className="space-y-4">
            <MonthCalendar
              month={date}
              selected={date}
              today={today}
              counts={counts}
            />
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Appunt." value={String(appointments.length)} />
              <Stat label="Incasso" value={formatPrice(revenue)} />
              <Stat label="Blocchi" value={String(blocks.length)} />
            </div>
          </div>

          {/* Colonna agenda del giorno */}
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl capitalize text-ink sm:text-3xl">
                  {formatDateLabel(date)}
                </h1>
                <p className="text-sm text-muted">
                  {isToday ? "Oggi" : date} · Agenda di {shop.name}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/admin?date=${addDays(date, -1)}`}
                  aria-label="Giorno precedente"
                  className="grid h-9 w-9 place-items-center rounded-md border border-line text-ink hover:border-gold"
                >
                  ‹
                </Link>
                {!isToday && (
                  <Link
                    href="/admin"
                    className="rounded-md border border-gold/50 px-3 py-2 text-sm text-gold hover:bg-gold hover:text-bg"
                  >
                    Oggi
                  </Link>
                )}
                <Link
                  href={`/admin?date=${addDays(date, 1)}`}
                  aria-label="Giorno successivo"
                  className="grid h-9 w-9 place-items-center rounded-md border border-line text-ink hover:border-gold"
                >
                  ›
                </Link>
              </div>
            </div>

            {/* Appuntamenti */}
            <section>
              <h2 className="signage mb-3 text-base text-muted">Appuntamenti</h2>
              {appointments.length === 0 ? (
                <p className="rounded-lg border border-dashed border-line bg-surface/50 px-5 py-10 text-center text-muted">
                  Nessun appuntamento per questo giorno.
                </p>
              ) : (
                <ul className="space-y-3">
                  {appointments.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-line bg-surface p-3 sm:p-4"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="shrink-0 rounded-md border border-gold/40 bg-gold/5 px-2.5 py-2 text-center">
                          <div className="font-display text-base leading-none text-gold sm:text-lg">
                            {minutesToHHMM(a.startMin)}
                          </div>
                          <div className="mt-1 text-[10px] text-muted">
                            {minutesToHHMM(a.endMin)}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink">
                            {a.customerName}
                          </p>
                          <p className="text-sm text-gold">{a.serviceName}</p>
                          <p className="mt-1 break-words text-sm text-muted">
                            <a
                              href={`tel:${a.customerPhone.replace(/\s/g, "")}`}
                              className="hover:text-ink"
                            >
                              {a.customerPhone}
                            </a>
                            {a.customerEmail && <> · {a.customerEmail}</>}
                          </p>
                          {a.notes && (
                            <p className="mt-1 text-sm italic text-muted">
                              “{a.notes}”
                            </p>
                          )}
                        </div>
                      </div>
                      <form action={cancelAppointment}>
                        <input type="hidden" name="id" value={a.id} />
                        <ConfirmButton
                          confirm={`Annullare l'appuntamento di ${a.customerName} alle ${minutesToHHMM(a.startMin)}?`}
                          className="rounded-md border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:border-danger hover:text-danger"
                        >
                          Annulla
                        </ConfirmButton>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Blocchi / indisponibilità */}
            <section className="mt-8">
              <h2 className="signage mb-3 text-base text-muted">
                Blocca orari (pause, ferie)
              </h2>
              <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
                <AddBlockForm date={date} />
              </div>

              {blocks.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {blocks.map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm"
                    >
                      <span>
                        <span className="font-semibold text-ink">
                          {minutesToHHMM(b.startMin)}–{minutesToHHMM(b.endMin)}
                        </span>
                        {b.reason && (
                          <span className="text-muted"> · {b.reason}</span>
                        )}
                      </span>
                      <form action={removeBlock}>
                        <input type="hidden" name="id" value={b.id} />
                        <ConfirmButton
                          confirm="Rimuovere questo blocco?"
                          className="text-muted transition-colors hover:text-danger"
                        >
                          ✕
                        </ConfirmButton>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3 text-center">
      <div className="font-display text-lg text-ink sm:text-xl">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-muted">
        {label}
      </div>
    </div>
  );
}
