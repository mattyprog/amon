import type { Metadata } from "next";
import { getShop } from "@/lib/shop";
import { getSession } from "@/lib/session";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { InstallPrompt } from "@/components/InstallPrompt";
import { BottomNav } from "./BottomNav";

// App gestionale del barbiere: manifest separato ("Amon Agenda"), così sul
// telefono è un'app a sé, distinta dal sito clienti.
export async function generateMetadata(): Promise<Metadata> {
  const shop = await getShop();
  return {
    title: { default: "Agenda", template: `%s · ${shop.name} Agenda` },
    robots: { index: false, follow: false },
    manifest: "/admin.webmanifest",
    appleWebApp: {
      capable: true,
      title: `${shop.name} Agenda`,
      statusBarStyle: "black-translucent",
    },
    icons: { apple: "/apple-touch-icon.png" },
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Non autenticato (pagina di login): nessuna navigazione, solo il contenuto.
  if (!session) {
    return (
      <>
        <ServiceWorkerRegister />
        {children}
      </>
    );
  }

  return (
    <>
      <ServiceWorkerRegister />
      <div className="pb-20">{children}</div>
      <InstallPrompt />
      <BottomNav role={session.role} />
    </>
  );
}
