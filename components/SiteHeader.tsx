import { Link } from "next-view-transitions";
import { Logo } from "./Logo";
import { InstagramIcon } from "./InstagramIcon";
import { getShop } from "@/lib/shop";

/** Intestazione del sito pubblico: logo, navigazione, CTA Prenota. */
export async function SiteHeader() {
  const shop = await getShop();
  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-9 md:flex">
          {[
            { href: "/#servizi", label: "Servizi" },
            { href: "/#esperienza", label: "Esperienza" },
            { href: "/#dove", label: "Dove siamo" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="link-underline signage text-[13px] text-muted transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          {shop.instagram && (
            <a
              href={shop.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hidden text-muted transition-colors hover:text-ink sm:block"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          )}
          <Link
            href="/prenota"
            className="signage rounded-sm bg-ink px-5 py-2.5 text-[13px] text-bg transition-all hover:bg-gold-soft"
          >
            Prenota
          </Link>
        </div>
      </div>
    </header>
  );
}
