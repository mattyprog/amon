import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { services, shop } from "@/lib/shop";
import { upcomingDates, weekdayOf, formatDateShort } from "@/lib/time";
import { openingHours } from "@/lib/shop";
import { BookingForm, type DayOption } from "./BookingForm";

export const metadata: Metadata = {
  title: "Prenota",
  description: `Prenota online il tuo appuntamento da ${shop.name}.`,
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ servizio?: string }>;
}) {
  const { servizio } = await searchParams;

  // Calcoliamo lato server l'elenco dei giorni prenotabili (saltando i giorni
  // di chiusura) così il client e il server vedono lo stesso "oggi".
  const days: DayOption[] = upcomingDates(shop.bookingHorizonDays)
    .filter((date) => (openingHours[weekdayOf(date)] ?? []).length > 0)
    .map((date) => ({ date, label: formatDateShort(date) }));

  const initialService =
    services.find((s) => s.id === servizio)?.id ?? services[0].id;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 py-14">
        <Link
          href="/"
          className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          ← Torna alla home
        </Link>
        <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl">
          Prenota il tuo appuntamento
        </h1>
        <p className="mt-3 text-muted">
          Scegli il servizio, il giorno e l&apos;orario. Conferma immediata.
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
