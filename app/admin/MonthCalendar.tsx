"use client";

import { useRouter } from "next/navigation";
import {
  monthGrid,
  monthLabel,
  addMonths,
  isSameMonth,
  dayOfMonth,
} from "@/lib/time";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

/** Calendario mensile con badge del numero di appuntamenti per giorno. */
export function MonthCalendar({
  month,
  selected,
  today,
  counts,
}: {
  month: string; // una data qualsiasi nel mese da mostrare
  selected: string;
  today: string;
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const days = monthGrid(month);
  const go = (date: string) => router.push(`/admin?date=${date}`);

  return (
    <div className="rounded-xl border border-line bg-surface p-3 sm:p-4">
      {/* Intestazione mese + navigazione */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Mese precedente"
          onClick={() => go(addMonths(month, -1))}
          className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink hover:border-gold"
        >
          ‹
        </button>
        <h2 className="signage text-lg text-ink">{monthLabel(month)}</h2>
        <button
          type="button"
          aria-label="Mese successivo"
          onClick={() => go(addMonths(month, 1))}
          className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink hover:border-gold"
        >
          ›
        </button>
      </div>

      {/* Giorni della settimana */}
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wide text-muted">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Griglia */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const inMonth = isSameMonth(d, month);
          const isSelected = d === selected;
          const isToday = d === today;
          const count = counts[d] ?? 0;
          return (
            <button
              key={d}
              type="button"
              onClick={() => go(d)}
              className={[
                "relative aspect-square rounded-lg border text-sm transition-colors",
                isSelected
                  ? "border-gold bg-gold text-bg font-semibold"
                  : inMonth
                    ? "border-transparent bg-surface-2 text-ink hover:border-gold/50"
                    : "border-transparent bg-transparent text-muted/40",
                isToday && !isSelected ? "ring-1 ring-gold/60" : "",
              ].join(" ")}
            >
              <span className="absolute left-0 right-0 top-1.5 text-center">
                {dayOfMonth(d)}
              </span>
              {count > 0 && (
                <span
                  className={[
                    "absolute bottom-1.5 left-1/2 -translate-x-1/2 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-semibold",
                    isSelected ? "bg-bg text-gold" : "bg-gold text-bg",
                  ].join(" ")}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
