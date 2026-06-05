// Configurazione PURA del negozio: costanti, tipi, valori di default e helper.
// NON importa il database, quindi è sicura da usare anche nei componenti
// client (es. il form di prenotazione). I lettori dal DB stanno in lib/shop.ts.

// Costanti tecniche (non modificabili dall'interfaccia).
export const TIMEZONE = "Europe/Rome";
export const SLOT_STEP_MIN = 15; // ogni quanto può iniziare un appuntamento
export const BOOKING_HORIZON_DAYS = 30; // quanti giorni in avanti si prenota

// --- Dati negozio (modificabili) ---
export type ShopInfo = {
  name: string;
  tagline: string;
  claim: string;
  phone: string;
  email: string;
  address: string;
  instagram: string;
  instagramHandle: string;
};

export const SHOP_DEFAULTS: ShopInfo = {
  name: "Amon",
  tagline: "Barberia",
  claim: "Taglio, barba e cura. Su misura per te.",
  phone: "+39 351 000 0000",
  email: "info@amonbarber.it",
  address: "Via del Taglio 12, Milano",
  instagram: "https://www.instagram.com/amon.barberia",
  instagramHandle: "@amon.barberia",
};

export const SHOP_FIELDS: { key: keyof ShopInfo; label: string }[] = [
  { key: "name", label: "Nome" },
  { key: "tagline", label: "Sottotitolo" },
  { key: "claim", label: "Frase d'effetto" },
  { key: "phone", label: "Telefono" },
  { key: "email", label: "Email" },
  { key: "address", label: "Indirizzo" },
  { key: "instagram", label: "Link Instagram" },
  { key: "instagramHandle", label: "Handle Instagram" },
];

// --- Servizi ---
export type Service = {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  priceCents: number;
};

export const DEFAULT_SERVICES: Omit<Service, "id">[] = [
  {
    name: "Taglio",
    description: "Taglio classico o moderno, lavaggio e styling.",
    durationMin: 30,
    priceCents: 2000,
  },
  {
    name: "Barba",
    description: "Rifinitura e modellatura barba con panno caldo.",
    durationMin: 20,
    priceCents: 1500,
  },
  {
    name: "Taglio + Barba",
    description: "Il pacchetto completo: taglio, barba e styling.",
    durationMin: 45,
    priceCents: 3000,
  },
];

// --- Orari di apertura (0=dom … 6=sab) ---
const H = (h: number, m = 0) => h * 60 + m;

export const DEFAULT_HOURS: Record<number, Array<[number, number]>> = {
  0: [],
  1: [],
  2: [[H(9), H(13)], [H(15), H(19)]],
  3: [[H(9), H(13)], [H(15), H(19)]],
  4: [[H(9), H(13)], [H(15), H(19)]],
  5: [[H(9), H(13)], [H(15), H(20)]],
  6: [[H(9), H(18)]],
};

export const weekdayNames = [
  "Domenica",
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
];

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
