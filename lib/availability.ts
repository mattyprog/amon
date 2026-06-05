import { prisma } from "./prisma";
import { SLOT_STEP_MIN, getOpeningHours } from "./shop";
import { todayInShop, nowMinutesInShop, weekdayOf } from "./time";

/** Un intervallo occupato [start, end) in minuti dalla mezzanotte. */
export type Interval = { startMin: number; endMin: number };

/** Due intervalli si sovrappongono? (estremi esclusi) */
export function overlaps(a: Interval, b: Interval): boolean {
  return a.startMin < b.endMin && b.startMin < a.endMin;
}

/**
 * Calcola gli orari di inizio disponibili per un servizio in un dato giorno.
 * Funzione pura: riceve già le fasce di apertura del giorno e gli intervalli
 * occupati, così è facile da testare e non dipende dal database.
 */
export function computeSlots(params: {
  segments: Array<[number, number]>;
  durationMin: number;
  busy: Interval[];
  stepMin?: number;
  /** Minuti correnti se il giorno è oggi, altrimenti undefined (giorno futuro). */
  nowMin?: number;
}): number[] {
  const { segments, durationMin, busy, nowMin } = params;
  const step = params.stepMin ?? SLOT_STEP_MIN;
  const slots: number[] = [];

  for (const [open, close] of segments) {
    for (let start = open; start + durationMin <= close; start += step) {
      const candidate: Interval = { startMin: start, endMin: start + durationMin };
      if (nowMin !== undefined && start <= nowMin) continue;
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
  const [hours, busy] = await Promise.all([
    getOpeningHours(),
    getBusyIntervals(date),
  ]);
  const segments = hours[weekdayOf(date)] ?? [];
  const nowMin = date === todayInShop() ? nowMinutesInShop() : undefined;
  return computeSlots({ segments, durationMin, busy, nowMin });
}
