"use client";

import { motion } from "framer-motion";

/**
 * Transizione tra le pagine pubbliche. Il `template` di Next viene rimontato
 * a ogni navigazione: il contenuto entra in dissolvenza con una salita.
 * Header e footer (nel layout) restano fissi. Funziona su tutti i browser.
 */
export default function SiteTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
