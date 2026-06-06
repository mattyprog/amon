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

  return (
    <>
      <SiteHeader />

      {/* ───────────────── HERO ───────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <p className="eyebrow">{shop.tagline} — {city}</p>
            <h1 className="mt-5 font-display text-[3.1rem] font-semibold leading-[0.98] tracking-tight text-ink sm:text-7xl">
              L&apos;arte del taglio,
              <br />
              <span className="italic text-muted">curata nel dettaglio.</span>
            </h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-muted">
              Taglio, barba e rasatura tradizionale nel cuore di {city}.
              Prenota il tuo momento, al resto pensiamo noi.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/prenota"
                className="signage rounded-sm bg-ink px-7 py-3.5 text-sm text-bg transition-colors hover:bg-gold-soft"
              >
                Prenota ora
              </Link>
              <a
                href={`tel:${shop.phone.replace(/\s/g, "")}`}
                className="signage rounded-sm border border-line-strong px-7 py-3.5 text-sm text-ink transition-colors hover:border-ink"
              >
                Chiama
              </a>
            </div>
            <dl className="mt-12 flex flex-wrap gap-x-12 gap-y-5 border-t border-line/70 pt-7">
              <div>
                <dt className="eyebrow">Orari</dt>
                <dd className="mt-1 text-sm text-ink">Mar — Sab · 9:00–19:00</dd>
              </div>
              <div>
                <dt className="eyebrow">Dove</dt>
                <dd className="mt-1 text-sm text-ink">{shop.address}</dd>
              </div>
            </dl>
          </Reveal>

          {/* Marchio su disco */}
          <Reveal delay={120} className="hidden lg:block">
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <div className="absolute inset-0 rounded-full border border-line" />
              <div className="absolute inset-8 rounded-full border border-line/60" />
              <div className="absolute inset-3 grid place-items-center rounded-full bg-gradient-to-b from-surface to-black shadow-[0_30px_80px_-30px_rgba(255,255,255,0.18)]">
                <div className="text-center">
                  <LogoMark className="mx-auto h-44 w-44 text-ink" />
                  <div className="eyebrow mt-4">Est. 2026 · {city}</div>
                </div>
              </div>
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

      {/* ───────────────── SERVIZI ───────────────── */}
      <section id="servizi" className="mx-auto max-w-6xl px-5 py-24 sm:px-6">
        <Reveal className="mb-14 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Listino</p>
            <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">I servizi</h2>
          </div>
          <Link
            href="/prenota"
            className="signage hidden text-[13px] text-muted underline-offset-8 hover:text-ink hover:underline sm:inline"
          >
            Prenota →
          </Link>
        </Reveal>

        <div className="border-t border-line/70">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i * 60}>
              <Link
                href={`/prenota?servizio=${s.id}`}
                className="group flex items-center justify-between gap-6 border-b border-line/70 py-7 transition-colors hover:bg-surface/40"
              >
                <div className="flex items-baseline gap-5">
                  <span className="font-display text-sm text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl text-ink transition-colors group-hover:text-gold sm:text-3xl">
                      {s.name}
                    </h3>
                    <p className="mt-1 max-w-md text-sm text-muted">{s.description}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display text-2xl text-ink">{formatPrice(s.priceCents)}</div>
                  <div className="eyebrow mt-1">{s.durationMin} min</div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────── STATEMENT ───────────────── */}
      <section className="border-y border-line/70 bg-surface/30">
        <Reveal className="mx-auto max-w-4xl px-5 py-28 text-center sm:px-6">
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
      <section id="esperienza" className="mx-auto max-w-6xl px-5 py-24 sm:px-6">
        <Reveal className="mb-14 text-center">
          <p className="eyebrow">Come funziona</p>
          <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
            Semplice, come dovrebbe essere
          </h2>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-3">
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
              <div className="h-full rounded-lg border border-line bg-surface p-8">
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-sm border border-line-strong text-ink">
                    {step.icon}
                  </span>
                  <span className="font-display text-sm text-faint">
                    0{i + 1}
                  </span>
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
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Quando</p>
            <h2 className="mt-3 font-display text-4xl text-ink">Orari</h2>
            <ul className="mt-8 border-t border-line/70">
              {weekOrder.map((d) => {
                const closed = (openingHours[d] ?? []).length === 0;
                return (
                  <li
                    key={d}
                    className="flex items-center justify-between border-b border-line/70 py-3.5"
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
            <div className="mt-8 rounded-lg border border-line bg-surface p-8">
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
      <section className="mx-auto max-w-6xl px-5 py-28 sm:px-6">
        <Reveal className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-surface to-black px-6 py-20 text-center">
          <LogoMark className="mx-auto h-14 w-14 text-ink" />
          <h2 className="mx-auto mt-7 max-w-2xl font-display text-4xl leading-tight text-ink sm:text-6xl">
            Il tuo prossimo taglio inizia qui.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-muted">
            Scegli il momento perfetto. Ci pensiamo noi al resto.
          </p>
          <Link
            href="/prenota"
            className="signage mt-9 inline-block rounded-sm bg-ink px-9 py-4 text-sm text-bg transition-colors hover:bg-gold-soft"
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
