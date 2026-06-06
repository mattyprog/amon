"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Configura Framer Motion a livello globale.
 * reducedMotion="user" disattiva automaticamente i movimenti per chi ha
 * impostato "riduci animazioni" nel sistema operativo.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
