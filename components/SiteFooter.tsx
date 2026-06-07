import { Link } from "next-view-transitions";
import { getShop, getOpeningHours, weekdayNames } from "@/lib/shop";
import { minutesToHHMM } from "@/lib/time";
import { InstagramIcon } from "./InstagramIcon";
import { LogoMark } from "./LogoMark";

function hoursLabel(segments: Array<[number, number]>): string {
  if (segments.length === 0) return "Chiuso";
  return segments.map(([a, b]) => `${minutesToHHMM(a)}–${minutesToHHMM(b)}`).join(" · ");
}

/** Footer con contatti e orari sintetici. */
export async function SiteFooter() {
  const [shop, hours] = await Promise.all([getShop(), getOpeningHours()]);
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <footer className="mt-auto border-t border-line/70 bg-surface">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark className="h-9 w-9 text-ink" />
            <span className="font-display text-2xl text-ink">{shop.name}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{shop.claim}</p>
          {shop.instagram && (
            <a
              href={shop.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
            >
              <InstagramIcon className="h-4 w-4" />
              {shop.instagramHandle}
            </a>
          )}
        </div>

        <div>
          <h3 className="eyebrow">Orari</h3>
          <ul className="mt-4 space-y-1.5 text-sm text-muted">
            {order.map((d) => (
              <li key={d} className="flex justify-between gap-4">
                <span className="text-ink/80">{weekdayNames[d]}</span>
                <span>{hoursLabel(hours[d] ?? [])}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow">Contatti</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
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
          </ul>
          <Link
            href="/admin"
            className="mt-5 inline-block text-xs text-faint underline-offset-2 hover:text-muted hover:underline"
          >
            Area barbiere
          </Link>
        </div>
      </div>
      <div className="border-t border-line/70 py-5 text-center text-xs text-faint">
        © {new Date().getFullYear()} {shop.name} {shop.tagline} · {shop.address.split(",").slice(-1)[0].trim()}
      </div>
    </footer>
  );
}
