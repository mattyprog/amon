import { Link } from "next-view-transitions";
import { getOpeningHours, weekdayNames } from "@/lib/shop";
import { ensureSeeded } from "@/lib/seed";
import { minutesToHHMM } from "@/lib/time";
import { HoursForm, type DayValue } from "./HoursForm";

export const metadata = { title: "Orari" };

export default async function HoursSettings() {
  await ensureSeeded();
  const hours = await getOpeningHours();

  const order = [1, 2, 3, 4, 5, 6, 0]; // lun → dom
  const days: DayValue[] = order.map((wd) => ({
    weekday: wd,
    label: weekdayNames[wd],
    value: (hours[wd] ?? [])
      .map(([a, b]) => `${minutesToHHMM(a)}-${minutesToHHMM(b)}`)
      .join(", "),
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link
        href="/admin/impostazioni"
        className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        ← Impostazioni
      </Link>
      <h1 className="mt-3 font-display text-3xl text-ink">Orari di apertura</h1>
      <p className="mt-1 text-sm text-muted">
        Da qui dipende la disponibilità mostrata ai clienti.
      </p>
      <div className="mt-6">
        <HoursForm days={days} />
      </div>
    </main>
  );
}
