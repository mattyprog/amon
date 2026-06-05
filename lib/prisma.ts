import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Singleton del client Prisma. In sviluppo Next.js ricarica i moduli a ogni
// modifica: senza questa cache creeremmo decine di connessioni al database.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Usiamo l'adapter libSQL sia in locale sia online:
// - in locale: un file SQLite (DATABASE_URL = file:./dev.db)
// - in produzione: il database ospitato su Turso (TURSO_DATABASE_URL + token)
// Stesso codice, stesso schema: cambia solo l'URL.
function createClient(): PrismaClient {
  const url =
    process.env.TURSO_DATABASE_URL ??
    process.env.DATABASE_URL ??
    "file:./dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const adapter = new PrismaLibSql(
    authToken ? { url, authToken } : { url },
  );
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
