import { prisma } from "./prisma";
import { hashPassword } from "./password";
import {
  DEFAULT_SERVICES,
  DEFAULT_HOURS,
  SHOP_DEFAULTS,
  SHOP_FIELDS,
} from "./shop";

// Inizializza il database al primo avvio:
// - crea l'utente TITOLARE (username "amon", password = ADMIN_PASSWORD);
// - popola servizi, orari e dati negozio con i valori di default.
// È idempotente: dopo la prima volta non sovrascrive nulla (il barbiere è
// libero di modificare o cancellare).

let ran = false;

export async function ensureSeeded(): Promise<void> {
  if (ran) return; // micro-cache per-processo: evita controlli ripetuti
  try {
    // 1) Almeno un utente deve esistere, altrimenti nessuno può accedere.
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      const password = process.env.ADMIN_PASSWORD || "amon2026";
      await prisma.user.create({
        data: {
          username: "amon",
          name: "Amon",
          role: "owner",
          passwordHash: await hashPassword(password),
        },
      });
    }

    // 2) Seeding dei dati (una sola volta, segnato dal flag "seeded").
    const flag = await prisma.setting.findUnique({ where: { key: "seeded" } });
    if (!flag) {
      if ((await prisma.service.count()) === 0) {
        await prisma.service.createMany({
          data: DEFAULT_SERVICES.map((s, i) => ({ ...s, sort: i })),
        });
      }
      if ((await prisma.openingHour.count()) === 0) {
        const rows = [];
        for (const wd of Object.keys(DEFAULT_HOURS)) {
          for (const [startMin, endMin] of DEFAULT_HOURS[Number(wd)]) {
            rows.push({ weekday: Number(wd), startMin, endMin });
          }
        }
        if (rows.length) await prisma.openingHour.createMany({ data: rows });
      }
      const settings = SHOP_FIELDS.map((f) => ({
        key: f.key as string,
        value: SHOP_DEFAULTS[f.key],
      }));
      settings.push({ key: "seeded", value: "1" });
      for (const s of settings) {
        await prisma.setting.upsert({
          where: { key: s.key },
          create: s,
          update: {},
        });
      }
    }
    ran = true;
  } catch (e) {
    // Se il DB non è ancora pronto non blocchiamo l'app.
    console.error("[seed] errore:", e);
  }
}
