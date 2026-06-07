"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Configura Framer Motion a livello globale. Le animazioni del sito fanno
 * parte dell'esperienza del brand, quindi vengono riprodotte sempre
 * (reducedMotion="never"), indipendentemente dalle impostazioni di sistema.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
