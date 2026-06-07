import { Link } from "next-view-transitions";
import { getServices } from "@/lib/shop";
import { ensureSeeded } from "@/lib/seed";
import { ServicesManager } from "./ServicesManager";

export const metadata = { title: "Servizi" };

export default async function ServicesSettings() {
  await ensureSeeded();
  const services = await getServices(true);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link
        href="/admin/impostazioni"
        className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        ← Impostazioni
      </Link>
      <h1 className="mt-3 font-display text-3xl text-ink">Servizi e prezzi</h1>
      <p className="mt-1 text-sm text-muted">
        Questi servizi appaiono sul sito e sono prenotabili dai clienti.
      </p>
      <div className="mt-6">
        <ServicesManager services={services} />
      </div>
    </main>
  );
}
