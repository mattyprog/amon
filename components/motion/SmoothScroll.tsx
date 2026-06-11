"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Altezza dell'header sticky: gli anchor si fermano poco sotto.
const ANCHOR_OFFSET = -92;

/**
 * Scroll fluido con inerzia (Lenis) per il sito pubblico.
 * - Ammorbidisce la rotellina/trackpad su desktop (su touch resta nativo).
 * - Intercetta i link interni (#servizi, /#dove…) e ci scorre dolcemente.
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Anchor della stessa pagina → scroll fluido invece del salto secco.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"], a[href^="/#"]',
      );
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const hash = href.slice(href.indexOf("#"));
      if (hash.length < 2) return;
      // Solo se l'ancora vive nella pagina corrente.
      if (href.startsWith("/#") && window.location.pathname !== "/") return;
      const el = document.querySelector(hash);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: ANCHOR_OFFSET });
      history.pushState(null, "", hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
