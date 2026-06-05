import Link from "next/link";
import { shop } from "@/lib/shop";
import { LogoMark } from "./LogoMark";

/** Logo di Amon: marchio esagonale + nome insegna. */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-3">
      <LogoMark className="h-10 w-10 text-ink transition-transform group-hover:scale-105" />
      <span className="flex flex-col leading-none">
        <span className="signage text-xl text-ink">{shop.name}</span>
        <span className="text-[10px] tracking-[0.35em] text-muted uppercase">
          {shop.tagline}
        </span>
      </span>
    </Link>
  );
}
