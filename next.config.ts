import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fissa la radice del progetto: con più package-lock.json nelle cartelle
  // superiori (Desktop, home) Turbopack potrebbe scegliere quella sbagliata.
  turbopack: {
    root: __dirname,
  },
  // libSQL ha binding nativi: vanno lasciati esterni al bundle server.
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql"],
};

export default nextConfig;
