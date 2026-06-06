// Aggiorna i dati del negozio (Settings) e gli orari di apertura nel database.
// Funziona sia in locale (DATABASE_URL=file:...) sia su Turso
// (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN), con la stessa logica del runtime.
//
// Uso:  node scripts/sync-shop-data.mjs

import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const url =
  process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const db = createClient(authToken ? { url, authToken } : { url });

// Dati reali del negozio.
const settings = {
  name: "Amon",
  tagline: "Barberia",
  claim: "Ogni dettaglio conta.",
  phone: "+39 351 000 0000",
  email: "info@amonbarberia.it",
  address: "Via Ponte Nuovo 26, Fondi",
  instagram: "https://www.instagram.com/amon.barberia",
  instagramHandle: "@amon.barberia",
};

for (const [key, value] of Object.entries(settings)) {
  await db.execute({
    sql: `INSERT INTO "Setting"("key","value") VALUES (?,?)
          ON CONFLICT("key") DO UPDATE SET "value"=excluded."value"`,
    args: [key, value],
  });
}

// Orari: Martedì–Sabato 9:00–19:00 (weekday 2..6). Domenica/Lunedì chiuso.
await db.execute(`DELETE FROM "OpeningHour"`);
const cuid = () => "oh_" + Math.random().toString(36).slice(2, 12);
for (let wd = 2; wd <= 6; wd++) {
  await db.execute({
    sql: `INSERT INTO "OpeningHour"("id","weekday","startMin","endMin") VALUES (?,?,?,?)`,
    args: [cuid(), wd, 9 * 60, 19 * 60],
  });
}

const s = await db.execute(`SELECT key,value FROM "Setting" ORDER BY key`);
const h = await db.execute(
  `SELECT weekday,startMin,endMin FROM "OpeningHour" ORDER BY weekday`,
);
console.log("Settings:", Object.fromEntries(s.rows.map((r) => [r.key, r.value])));
console.log("Orari (weekday→min):", h.rows.map((r) => `${r.weekday}:${r.startMin}-${r.endMin}`).join(", "));
console.log("Fatto ✅");
