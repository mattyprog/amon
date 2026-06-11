"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Dà profondità all'hero: scorrendo verso il basso il contenuto sale più
 * lentamente dello scroll e sfuma leggermente (effetto "sipario").
 */
export function HeroShift({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.15]);

  return (
    <div ref={ref}>
      <motion.div style={{ y, opacity }}>{children}</motion.div>
    </div>
  );
}
