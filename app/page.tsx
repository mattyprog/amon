import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LogoMark } from "@/components/LogoMark";
import { Reveal } from "@/components/Reveal";
import {
  getShop,
  getServices,
  getOpeningHours,
  weekdayNames,
  formatPrice,
} from "@/lib/shop";
import { minutesToHHMM } from "@/lib/time";

// Legge i dati dal database (gestiti dal barbiere): niente prerender statico,
// così le modifiche a servizi/orari/negozio si vedono subito sul sito.
export const dynamic = "force-dynamic";

function hoursLabel(segments: Array<[number, number]>): string {
  if (segments.length === 0) return "Chiuso";
  return segments.map(([a, b]) => `${minutesToHHMM(a)}–${minutesToHHMM(b)}`).join(" · ");
}

export default async function HomePage() {
  const [shop, services, openingHours] = await Promise.all([
    getShop(),
    getServices(),
    getOpeningHours(),
  ]);
  const city = shop.address.split(",").slice(-1)[0].trim();
  const weekOrder = [1, 2, 3, 4, 5, 6, 0];
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(shop.address)}`;

  // Riepilogo orari per l'hero: raggruppa i giorni aperti uguali.
  const openDays = weekOrder.filter((d) => (openingHours[d] ?? []).length > 0);
  const openSummary =
    openDays.length > 0
      ? `${weekdayNames[openDays[0]].slice(0, 3)} — ${weekdayNames[openDays[openDays.length - 1]].slice(0, 3)}`
      : "Su appuntamento";
  const openTimes = openDays.length > 0 ? hoursLabel(openingHours[openDays[0]]) : "—";

  return (
    <>
      <SiteHeader />

      {/* ───────────────── HERO ───────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[1.45fr_1fr] lg:gap-20 lg:py-28">
          <Reveal>
            <p className="eyebrow">{shop.tagline} — {city}</p>
            <h1 className="mt-6 font-display font-semibold leading-[0.95] tracking-tight text-ink text-[clamp(3rem,8vw,7rem)]">
              L&apos;arte del taglio,
              <br />
              <span className="italic text-muted">curata nel dettaglio.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
              Taglio, barba e rasatura tradizionale nel cuore di {city}.
              Prenota il tuo momento, al resto pensiamo noi.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/prenota"
                className="signage rounded-sm bg-ink px-8 py-4 text-sm text-bg transition-colors hover:bg-gold-soft"
              >
                Prenota ora
              </Link>
              <a
                href={`tel:${shop.phone.replace(/\s/g, "")}`}
                className="signage rounded-sm border border-line-strong px-8 py-4 text-sm text-ink transition-colors hover:border-ink"
              >
                Chiama
              </a>
            </div>
          </Reveal>

          {/* Pannello informazioni (sostituisce il disco) */}
          <Reveal delay={120}>
            <div className="rounded-2xl border border-line bg-gradient-to-b from-surface to-black p-8">
              <div className="flex items-center gap-3 border-b border-line/70 pb-6">
                <LogoMark className="h-10 w-10 text-ink" />
                <div>
                  <div className="signage text-base text-ink">{shop.name}</div>
                  <div className="eyebrow">{shop.tagline}</div>
                </div>
              </div>
              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="eyebrow">Orari</dt>
                  <dd className="mt-1.5 text-ink">
                    {openSummary} · <span className="text-muted">{openTimes}</span>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Indirizzo</dt>
                  <dd className="mt-1.5 text-ink">{shop.address}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Contatti</dt>
                  <dd className="mt-1.5">
                    <a
                      href={`tel:${shop.phone.replace(/\s/g, "")}`}
                      className="text-ink transition-colors hover:text-muted"
                    >
                      {shop.phone}
                    </a>
                  </dd>
                </div>
              </dl>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="signage mt-7 block rounded-sm border border-line-strong py-3 text-center text-[13px] text-ink transition-colors hover:border-ink"
              >
                Apri in mappa
              </a>
            </div>
          </Reveal>
        </div>

        {/* Striscia scorrevole */}
        <div className="marquee border-y border-line/70 bg-surface/40 py-4">
          <div className="marquee__track">
            {[0, 1].map((rep) => (
              <div key={rep} className="flex items-center gap-12" aria-hidden={rep === 1}>
                {["Taglio", "Barba", "Rasatura tradizionale", "Styling", "Ogni dettaglio conta"].map(
                  (w) => (
                    <span key={w} className="flex items-center gap-12">
                      <span className="signage text-sm text-muted">{w}</span>
                      <Dot />
                    </span>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── SERVIZI (a card) ───────────────── */}
      <section id="servizi" className="mx-auto max-w-[1400px] px-6 py-24">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Listino</p>
            <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">I servizi</h2>
          </div>
          <Link
            href="/prenota"
            className="signage text-[13px] text-muted underline-offset-8 hover:text-ink hover:underline"
          >
            Prenota →
          </Link>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i * 70}>
              <Link
                href={`/prenota?servizio=${s.id}`}
                className="group flex h-full flex-col justify-between rounded-xl border border-line bg-surface p-7 transition-colors hover:border-line-strong"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-2xl text-ink transition-colors group-hover:text-gold">
                      {s.name}
                    </h3>
                    <span className="font-display text-2xl text-ink">
                      {formatPrice(s.priceCents)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{s.description}</p>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-line/70 pt-4">
                  <span className="eyebrow">{s.durationMin} min</span>
                  <span className="signage text-[12px] text-muted transition-colors group-hover:text-ink">
                    Prenota →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────── STATEMENT ───────────────── */}
      <section className="border-y border-line/70 bg-surface/30">
        <Reveal className="mx-auto max-w-4xl px-6 py-28 text-center">
          <LogoMark className="mx-auto h-12 w-12 text-faint" />
          <p className="mt-8 font-display text-3xl italic leading-snug text-ink sm:text-5xl">
            “Ogni dettaglio conta.”
          </p>
          <p className="mx-auto mt-6 max-w-xl text-muted">
            Non è solo un taglio: è cura, precisione e tempo dedicato a te. La
            differenza sta nei particolari.
          </p>
        </Reveal>
      </section>

      {/* ───────────────── ESPERIENZA ───────────────── */}
      <section id="esperienza" className="mx-auto max-w-[1400px] px-6 py-24">
        <Reveal className="mb-14 text-center">
          <p className="eyebrow">Come funziona</p>
          <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
            Semplice, come dovrebbe essere
          </h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: <IconCalendar />,
              t: "Prenoti",
              d: "Scegli servizio, giorno e orario tra quelli liberi. Conferma in pochi secondi.",
            },
            {
              icon: <IconChair />,
              t: "Ti accomodi",
              d: "Arrivi all'orario scelto: niente attese, niente code. Solo il tuo momento.",
            },
            {
              icon: <IconStar />,
              t: "Esci impeccabile",
              d: "Taglio curato nel dettaglio, su misura per te. Pronto a farti notare.",
            },
          ].map((step, i) => (
            <Reveal key={step.t} delay={i * 90}>
              <div className="h-full rounded-xl border border-line bg-surface p-8">
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-sm border border-line-strong text-ink">
                    {step.icon}
                  </span>
                  <span className="font-display text-sm text-faint">0{i + 1}</span>
                </div>
                <h3 className="mt-6 font-display text-2xl text-ink">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────── ORARI + DOVE ───────────────── */}
      <section id="dove" className="border-t border-line/70 bg-surface/30">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="eyebrow">Quando</p>
            <h2 className="mt-3 font-display text-4xl text-ink">Orari</h2>
            <ul className="mt-8 border-t border-line/70">
              {weekOrder.map((d) => {
                const closed = (openingHours[d] ?? []).length === 0;
                return (
                  <li
                    key={d}
                    className="flex items-center justify-between border-b border-line/70 py-4"
                  >
                    <span className="signage text-sm text-ink">{weekdayNames[d]}</span>
                    <span className={`text-sm ${closed ? "text-faint" : "text-muted"}`}>
                      {hoursLabel(openingHours[d] ?? [])}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <p className="eyebrow">Dove</p>
            <h2 className="mt-3 font-display text-4xl text-ink">Vieni a trovarci</h2>
            <div className="mt-8 rounded-xl border border-line bg-surface p-8">
              <p className="font-display text-2xl text-ink">{shop.address}</p>
              <p className="mt-3 text-muted">
                <a
                  href={`tel:${shop.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-ink"
                >
                  {shop.phone}
                </a>
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="signage rounded-sm border border-line-strong px-6 py-3 text-[13px] text-ink transition-colors hover:border-ink"
                >
                  Apri in mappa
                </a>
                {shop.instagram && (
                  <a
                    href={shop.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="signage rounded-sm border border-line-strong px-6 py-3 text-[13px] text-ink transition-colors hover:border-ink"
                  >
                    {shop.instagramHandle}
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────── CTA ───────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 py-28">
        <Reveal className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-surface to-black px-6 py-24 text-center">
          <LogoMark className="mx-auto h-14 w-14 text-ink" />
          <h2 className="mx-auto mt-7 max-w-3xl font-display leading-tight text-ink text-[clamp(2.25rem,5vw,4rem)]">
            Il tuo prossimo taglio inizia qui.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-muted">
            Scegli il momento perfetto. Ci pensiamo noi al resto.
          </p>
          <Link
            href="/prenota"
            className="signage mt-9 inline-block rounded-sm bg-ink px-10 py-4 text-sm text-bg transition-colors hover:bg-gold-soft"
          >
            Prenota ora
          </Link>
        </Reveal>
      </section>

      <SiteFooter />
    </>
  );
}

/* ── Dettagli grafici ── */
function Dot() {
  return <span className="inline-block h-1 w-1 rounded-full bg-faint" />;
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconCalendar() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  );
}
function IconChair() {
  return (
    <svg {...iconProps}>
      <path d="M6 4v8h12V4M5 12h14M7 12v8M17 12v8M5 16h14" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg {...iconProps}>
      <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.5 9.2l5.9-.9z" />
    </svg>
  );
}
