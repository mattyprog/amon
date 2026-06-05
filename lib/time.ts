import { TIMEZONE } from "./config";

// Utility per lavorare con date e orari nel fuso orario del negozio,
// indipendentemente da come è configurato il server.

/** Restituisce la data odierna nel negozio come "YYYY-MM-DD". */
export function todayInShop(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Minuti dalla mezzanotte dell'ora corrente nel negozio (0–1439). */
export function nowMinutesInShop(): number {
  const parts = new Intl.DateTimeFormat("it-IT", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}

/** Giorno della settimana (0 = domenica) per una data "YYYY-MM-DD". */
export function weekdayOf(date: string): number {
  // Mezzogiorno locale: evita slittamenti di giorno dovuti al fuso.
  return new Date(`${date}T12:00:00`).getDay();
}

/** Aggiunge `days` giorni a una data "YYYY-MM-DD" e la restituisce nello stesso formato. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Lista delle prossime `count` date prenotabili a partire da oggi (incluso). */
export function upcomingDates(count: number): string[] {
  const start = todayInShop();
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

/** Converte minuti dalla mezzanotte in "HH:mm". */
export function minutesToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Etichetta leggibile di una data, es. "Sabato 7 giugno". */
export function formatDateLabel(date: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T12:00:00`));
}

/** Etichetta breve di una data, es. "sab 7 giu". */
export function formatDateShort(date: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));
}

// --- Helper per il calendario mensile ---

/** Primo giorno del mese di `date`, come "YYYY-MM-01". */
export function startOfMonth(date: string): string {
  return `${date.slice(0, 7)}-01`;
}

/** Sposta di `n` mesi (può essere negativo) e restituisce il primo del mese. */
export function addMonths(date: string, n: number): string {
  const d = new Date(`${startOfMonth(date)}T12:00:00`);
  d.setMonth(d.getMonth() + n);
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Etichetta del mese, es. "Giugno 2026". */
export function monthLabel(date: string): string {
  const s = new Intl.DateTimeFormat("it-IT", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${startOfMonth(date)}T12:00:00`));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Numero del giorno (1–31) di una data. */
export function dayOfMonth(date: string): number {
  return Number(date.slice(8, 10));
}

/**
 * Griglia di 42 date (6 settimane × 7 giorni) che copre il mese di `date`,
 * a partire dal lunedì. I giorni fuori dal mese servono a riempire la griglia.
 */
export function monthGrid(date: string): string[] {
  const first = startOfMonth(date);
  const firstWeekday = weekdayOf(first); // 0=dom
  // Quanti giorni indietro per arrivare al lunedì precedente (lun=0).
  const back = (firstWeekday + 6) % 7;
  const gridStart = addDays(first, -back);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

/** True se le due date sono nello stesso mese/anno. */
export function isSameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}
