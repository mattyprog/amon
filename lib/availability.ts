import { prisma } from "./prisma";
import { openingHours, shop, getService } from "./shop";
import { todayInShop, nowMinutesInShop, weekdayOf } from "./time";

/** Un intervallo occupato [start, end) in minuti dalla mezzanotte. */
export type Interval = { startMin: number; endMin: number };

/** Due intervalli si sovrappongono? (estremi esclusi: 12:00–12:30 e 12:30–13:00 NON si toccano) */
export function overlaps(a: Interval, b: Interval): boolean {
  return a.startMin < b.endMin && b.startMin < a.endMin;
}

/**
 * Calcola gli orari di inizio disponibili per un servizio in un dato giorno.
 * Funzione pura: riceve già la lista degli intervalli occupati, così è
 * facile da testare e non dipende dal database.
 */
export function computeSlots(params: {
  date: string;
  durationMin: number;
  busy: Interval[];
  /** Minuti correnti se il giorno è oggi, altrimenti undefined (giorno futuro). */
  nowMin?: number;
}): number[] {
  const { date, durationMin, busy, nowMin } = params;
  const segments = openingHours[weekdayOf(date)] ?? [];
  const slots: number[] = [];

  for (const [open, close] of segments) {
    for (let start = open; start + durationMin <= close; start += shop.slotStepMin) {
      const candidate: Interval = { startMin: start, endMin: start + durationMin };
      // Scarta gli orari già passati se stiamo guardando oggi.
      if (nowMin !== undefined && start <= nowMin) continue;
      // Scarta se si sovrappone a una prenotazione o a un blocco.
      if (busy.some((b) => overlaps(candidate, b))) continue;
      slots.push(start);
    }
  }
  return slots;
}

/** Carica gli intervalli occupati (prenotazioni confermate + blocchi) di un giorno. */
export async function getBusyIntervals(date: string): Promise<Interval[]> {
  const [appointments, blocks] = await Promise.all([
    prisma.appointment.findMany({
      where: { date, status: "confirmed" },
      select: { startMin: true, endMin: true },
    }),
    prisma.block.findMany({
      where: { date },
      select: { startMin: true, endMin: true },
    }),
  ]);
  return [...appointments, ...blocks];
}

/** Orari di inizio disponibili per un servizio in un giorno, leggendo dal DB. */
export async function getAvailableSlots(
  date: string,
  durationMin: number,
): Promise<number[]> {
  const busy = await getBusyIntervals(date);
  const nowMin = date === todayInShop() ? nowMinutesInShop() : undefined;
  return computeSlots({ date, durationMin, busy, nowMin });
}
