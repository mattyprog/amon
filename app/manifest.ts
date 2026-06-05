import type { MetadataRoute } from "next";
import { SHOP_DEFAULTS as shop } from "@/lib/shop";

// Manifest del SITO CLIENTI (Amon Barberia). Rende installabile la parte
// pubblica, che si apre sulla home. L'AREA BARBIERE ha un manifest separato
// (public/admin.webmanifest) così risulta un'app distinta sul telefono.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${shop.name} ${shop.tagline}`,
    short_name: shop.name,
    description: "Prenota online taglio e barba da Amon.",
    start_url: "/",
    scope: "/",
    display: "standalone",
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
