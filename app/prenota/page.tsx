import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  getServices,
  getShop,
  getOpeningHours,
  BOOKING_HORIZON_DAYS,
} from "@/lib/shop";
import { upcomingDates, weekdayOf, formatDateShort } from "@/lib/time";
import { BookingForm, type DayOption } from "./BookingForm";

// Dipende dai dati gestiti dal barbiere (servizi, orari): sempre dinamica.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const shop = await getShop();
  return {
    title: "Prenota",
    description: `Prenota online il tuo appuntamento da ${shop.name}.`,
  };
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ servizio?: string }>;
}) {
  const { servizio } = await searchParams;
  const [services, openingHours] = await Promise.all([
    getServices(),
    getOpeningHours(),
  ]);

  // Calcoliamo lato server l'elenco dei giorni prenotabili (saltando i giorni
  // di chiusura) così il client e il server vedono lo stesso "oggi".
  const days: DayOption[] = upcomingDates(BOOKING_HORIZON_DAYS)
    .filter((date) => (openingHours[weekdayOf(date)] ?? []).length > 0)
    .map((date) => ({ date, label: formatDateShort(date) }));

  const initialService =
    services.find((s) => s.id === servizio)?.id ?? services[0].id;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-6">
        <Link
          href="/"
          className="signage text-[13px] text-muted underline-offset-8 hover:text-ink hover:underline"
        >
          ← Home
        </Link>
        <p className="eyebrow mt-6">Prenotazione</p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
          Il tuo appuntamento
        </h1>
        <p className="mt-3 text-muted">
          Servizio, giorno e orario. Conferma immediata, nessuna attesa.
        </p>

        <div className="mt-10">
          <BookingForm
            services={services}
            days={days}
            initialServiceId={initialService}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
