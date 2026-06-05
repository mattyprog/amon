// Configurazione del negozio. È l'unico punto da toccare per cambiare
// servizi, orari di apertura, prezzi e dati di contatto di Amon.

export const shop = {
  name: "Amon",
  tagline: "Barberia",
  // Frase d'effetto in homepage
  claim: "Taglio, barba e cura. Su misura per te.",
  phone: "+39 351 000 0000",
  email: "info@amonbarber.it",
  address: "Via del Taglio 12, Milano",
  instagram: "https://www.instagram.com/amon.barberia",
  instagramHandle: "@amon.barberia",
  // Fuso orario usato per calcolare \"oggi\" e gli slot disponibili.
  timezone: "Europe/Rome",
  // Quanti giorni in avanti si può prenotare.
  bookingHorizonDays: 30,
  // Passo della griglia di slot, in minuti (ogni quanto può iniziare un taglio).
  slotStepMin: 15,
} as const;

export type Service = {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  priceCents: number;
};

// Listino servizi. La durata determina quanti slot occupa la prenotazione.
export const services: Service[] = [
  {
    id: "taglio",
    name: "Taglio",
    description: "Taglio classico o moderno, lavaggio e styling.",
    durationMin: 30,
    priceCents: 2000,
  },
  {
    id: "barba",
    name: "Barba",
    description: "Rifinitura e modellatura barba con panno caldo.",
    durationMin: 20,
    priceCents: 1500,
  },
  {
    id: "taglio-barba",
    name: "Taglio + Barba",
    description: "Il pacchetto completo: taglio, barba e styling.",
    durationMin: 45,
    priceCents: 3000,
  },
  {
    id: "ragazzo",
    name: "Taglio Ragazzo",
    description: "Taglio per under 12.",
    durationMin: 20,
    priceCents: 1500,
  },
];

// Orari di apertura per giorno della settimana (0 = domenica … 6 = sabato).
// Ogni giorno è una lista di intervalli aperti [inizioMin, fineMin] in minuti
// dalla mezzanotte. Lista vuota = chiuso. La pausa pranzo è semplicemente
// l'assenza di un intervallo che la copre.
const H = (h: number, m = 0) => h * 60 + m;

export const openingHours: Record<number, Array<[number, number]>> = {
  0: [], // Domenica — chiuso
  1: [], // Lunedì — chiuso
  2: [[H(9), H(13)], [H(15), H(19)]], // Martedì
  3: [[H(9), H(13)], [H(15), H(19)]], // Mercoledì
  4: [[H(9), H(13)], [H(15), H(19)]], // Giovedì
  5: [[H(9), H(13)], [H(15), H(20)]], // Venerdì
  6: [[H(9), H(18)]], // Sabato (orario continuato)
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

export function getService(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
