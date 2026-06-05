import type { MetadataRoute } from "next";
import { shop } from "@/lib/shop";

// Web App Manifest: rende il sito installabile come app sul telefono.
// start_url punta all'agenda, così aprendo l'icona il barbiere entra
// direttamente nel calendario delle prenotazioni.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${shop.name} ${shop.tagline} — Agenda`,
    short_name: shop.name,
    description: "Gestione e calendario delle prenotazioni.",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#08080a",
    theme_color: "#08080a",
    lang: "it",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
