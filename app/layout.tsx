import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import { shop } from "@/lib/shop";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const city = shop.address.split(",").slice(-1)[0].trim();

export const metadata: Metadata = {
  title: {
    default: `${shop.name} — ${shop.tagline}`,
    template: `%s · ${shop.name}`,
  },
  description: `${shop.name} ${shop.tagline} a ${city}. ${shop.claim} Prenota online il tuo taglio in pochi secondi.`,
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${inter.variable} ${oswald.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
