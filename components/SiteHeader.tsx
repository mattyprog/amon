import Link from "next/link";
import { Logo } from "./Logo";
import { InstagramIcon } from "./InstagramIcon";
import { getShop } from "@/lib/shop";

/** Intestazione del sito pubblico: logo, navigazione, pulsante Prenota. */
export async function SiteHeader() {
  const shop = await getShop();
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/80 backdrop-blur supports-[backdrop-filter]:bg-bg/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted sm:flex">
          <Link href="/#servizi" className="transition-colors hover:text-ink">
            Servizi
          </Link>
          <Link href="/#orari" className="transition-colors hover:text-ink">
            Orari
          </Link>
          <Link href="/#dove" className="transition-colors hover:text-ink">
            Dove siamo
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {shop.instagram && (
            <a
              href={shop.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-muted transition-colors hover:text-ink"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          )}
          <Link
            href="/prenota"
            className="rounded-sm bg-gold px-4 py-2 text-sm font-semibold text-bg transition-colors hover:bg-gold-soft"
          >
            Prenota
          </Link>
        </div>
      </div>
    </header>
  );
}
