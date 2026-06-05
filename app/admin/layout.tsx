import type { Metadata } from "next";
import { shop } from "@/lib/shop";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

// Metadati per l'installazione come app su iOS (Aggiungi a Home).
export const metadata: Metadata = {
  title: { default: "Agenda", template: `%s · ${shop.name}` },
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    title: shop.name,
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ServiceWorkerRegister />
      {children}
    </>
  );
}
