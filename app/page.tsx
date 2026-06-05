import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LogoMark } from "@/components/LogoMark";
import {
  getShop,
  getServices,
  getOpeningHours,
  weekdayNames,
  formatPrice,
} from "@/lib/shop";
import { minutesToHHMM } from "@/lib/time";

function hoursLabel(segments: Array<[number, number]>): string {
  if (segments.length === 0) return "Chiuso";
  return segments
    .map(([a, b]) => `${minutesToHHMM(a)}–${minutesToHHMM(b)}`)
    .join(" · ");
}

export default async function HomePage() {
  const [shop, services, openingHours] = await Promise.all([
    getShop(),
    getServices(),
    getOpeningHours(),
  ]);
  const weekOrder = [1, 2, 3, 4, 5, 6, 0];

  return (
    <>
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="signage mb-4 text-sm text-gold">
              {shop.tagline} · {shop.address.split(",").slice(-1)[0].trim()}
            </p>
            <h1 className="font-display text-5xl leading-[0.95] text-ink sm:text-7xl">
              Il tuo stile,
              <br />
              <span className="text-gold">tagliato a regola d&apos;arte.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted">{shop.claim}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/prenota"
                className="rounded-sm bg-gold px-7 py-3 font-semibold text-bg transition-colors hover:bg-gold-soft"
              >
                Prenota ora
              </Link>
              <a
                href={`tel:${shop.phone.replace(/\s/g, "")}`}
                className="rounded-sm border border-line px-7 py-3 font-semibold text-ink transition-colors hover:border-gold hover:text-gold"
              >
                Chiama {shop.phone}
              </a>
            </div>
          </div>

          {/* Marchio su disco nero, come l'avatar Instagram */}
          <div className="relative mx-auto aspect-square w-full max-w-sm">
            <div className="absolute inset-0 rounded-full border border-line" />
            <div className="absolute inset-4 grid place-items-center rounded-full bg-black shadow-[0_0_60px_-10px_rgba(255,255,255,0.15)]">
              <div className="text-center">
                <LogoMark className="mx-auto h-40 w-40 text-ink sm:h-48 sm:w-48" />
                <div className="mt-3 text-[11px] uppercase tracking-[0.45em] text-muted">
                  Est. 2026
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVIZI */}
      <section id="servizi" className="border-t border-line/70 bg-surface/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <header className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="signage text-sm text-gold">Listino</p>
              <h2 className="font-display text-4xl text-ink">I nostri servizi</h2>
            </div>
            <Link
              href="/prenota"
              className="hidden text-sm text-gold underline-offset-4 hover:underline sm:inline"
            >
              Prenota un servizio →
            </Link>
          </header>

          <div className="grid gap-5 sm:grid-cols-2">
            {services.map((s) => (
              <Link
                key={s.id}
                href={`/prenota?servizio=${s.id}`}
                className="group flex items-start justify-between gap-6 rounded-md border border-line bg-surface p-6 transition-colors hover:border-gold/60"
              >
                <div>
                  <h3 className="signage text-xl text-ink group-hover:text-gold">
                    {s.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{s.description}</p>
                  <p className="mt-3 text-xs uppercase tracking-wide text-muted/70">
                    Durata {s.durationMin} min
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display text-2xl text-gold">
                    {formatPrice(s.priceCents)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ORARI + DOVE */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-2">
        <div id="orari">
          <p className="signage text-sm text-gold">Quando</p>
          <h2 className="font-display text-4xl text-ink">Orari di apertura</h2>
          <ul className="mt-6 divide-y divide-line/60 rounded-md border border-line bg-surface">
            {weekOrder.map((d) => {
              const closed = (openingHours[d] ?? []).length === 0;
              return (
                <li
                  key={d}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <span className="text-ink/90">{weekdayNames[d]}</span>
                  <span className={closed ? "text-muted/60" : "text-gold"}>
                    {hoursLabel(openingHours[d] ?? [])}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div id="dove">
          <p className="signage text-sm text-gold">Dove</p>
          <h2 className="font-display text-4xl text-ink">Vieni a trovarci</h2>
          <div className="mt-6 rounded-md border border-line bg-surface p-6">
            <p className="text-lg text-ink">{shop.address}</p>
            <p className="mt-2 text-muted">
              Telefono:{" "}
              <a
                href={`tel:${shop.phone.replace(/\s/g, "")}`}
                className="text-gold hover:underline"
              >
                {shop.phone}
              </a>
            </p>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(shop.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block rounded-sm border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-gold hover:text-gold"
            >
              Apri in mappa
            </a>
          </div>
          <div className="mt-5 rounded-md border border-gold/30 bg-gold/5 p-6">
            <p className="text-ink">
              Pronto per un nuovo look? Scegli servizio, giorno e orario in meno di un
              minuto.
            </p>
            <Link
              href="/prenota"
              className="mt-4 inline-block rounded-sm bg-gold px-6 py-2.5 font-semibold text-bg transition-colors hover:bg-gold-soft"
            >
              Prenota online
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
