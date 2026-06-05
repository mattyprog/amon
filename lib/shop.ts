import { prisma } from "./prisma";
import {
  SHOP_DEFAULTS,
  SHOP_FIELDS,
  DEFAULT_SERVICES,
  DEFAULT_HOURS,
  type ShopInfo,
  type Service,
} from "./config";

// Lettori dal DATABASE della configurazione del negozio (con fallback ai
// default se non ancora configurato). La parte pura — costanti, tipi, default,
// formatPrice — è in lib/config.ts ed è ri-esportata qui sotto per comodità
// dei componenti server.
export * from "./config";

/** Dati del negozio: i valori salvati sovrascrivono i default. */
export async function getShop(): Promise<ShopInfo> {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const out = { ...SHOP_DEFAULTS };
  for (const f of SHOP_FIELDS) {
    if (map[f.key] !== undefined && map[f.key] !== "") {
      out[f.key] = map[f.key];
    }
  }
  return out;
}

/** Servizi attivi ordinati. Se il DB è vuoto, usa i default. */
export async function getServices(includeInactive = false): Promise<Service[]> {
  const rows = await prisma.service.findMany({
    where: includeInactive ? undefined : { active: true },
    orderBy: [{ sort: "asc" }, { priceCents: "asc" }],
  });
  if (rows.length === 0) {
    return DEFAULT_SERVICES.map((s, i) => ({ id: `default-${i}`, ...s }));
  }
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    durationMin: r.durationMin,
    priceCents: r.priceCents,
  }));
}

/** Singolo servizio per id. */
export async function getServiceById(id: string): Promise<Service | null> {
  const all = await getServices(true);
  return all.find((s) => s.id === id) ?? null;
}

/** Orari di apertura come mappa giorno → fasce. Default se DB vuoto. */
export async function getOpeningHours(): Promise<
  Record<number, Array<[number, number]>>
> {
  const rows = await prisma.openingHour.findMany({
    orderBy: [{ weekday: "asc" }, { startMin: "asc" }],
  });
  if (rows.length === 0) return DEFAULT_HOURS;
  const map: Record<number, Array<[number, number]>> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
  };
  for (const r of rows) map[r.weekday].push([r.startMin, r.endMin]);
  return map;
}
