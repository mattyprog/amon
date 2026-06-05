import Link from "next/link";
import { getShop, getOpeningHours, weekdayNames } from "@/lib/shop";
import { minutesToHHMM } from "@/lib/time";
import { InstagramIcon } from "./InstagramIcon";

function hoursLabel(segments: Array<[number, number]>): string {
  if (segments.length === 0) return "Chiuso";
  return segments
    .map(([a, b]) => `${minutesToHHMM(a)}–${minutesToHHMM(b)}`)
    .join(" · ");
}

/** Footer con contatti e orari sintetici. */
export async function SiteFooter() {
  const [shop, hours] = await Promise.all([getShop(), getOpeningHours()]);
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <footer className="mt-auto border-t border-line/70 bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-3">
        <div>
          <span className="signage text-2xl text-ink">{shop.name}</span>
          <p className="mt-3 max-w-xs text-sm text-muted">{shop.claim}</p>
        </div>

        <div>
          <h3 className="signage text-sm text-gold">Orari</h3>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            {order.map((d) => (
              <li key={d} className="flex justify-between gap-4">
                <span className="text-ink/80">{weekdayNames[d]}</span>
                <span>{hoursLabel(hours[d] ?? [])}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="signage text-sm text-gold">Contatti</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>{shop.address}</li>
            <li>
              <a href={`tel:${shop.phone.replace(/\s/g, "")}`} className="hover:text-ink">
                {shop.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${shop.email}`} className="hover:text-ink">
                {shop.email}
              </a>
            </li>
            {shop.instagram && (
              <li>
                <a
                  href={shop.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-ink"
                >
                  <InstagramIcon className="h-4 w-4" />
                  {shop.instagramHandle}
                </a>
              </li>
            )}
          </ul>
          <Link
            href="/admin"
            className="mt-4 inline-block text-xs text-muted/60 underline-offset-2 hover:text-muted hover:underline"
          >
            Area barbiere
          </Link>
        </div>
      </div>
      <div className="border-t border-line/70 py-4 text-center text-xs text-muted/60">
        © {new Date().getFullYear()} {shop.name} {shop.tagline} · Tutti i diritti
        riservati
      </div>
    </footer>
  );
}
