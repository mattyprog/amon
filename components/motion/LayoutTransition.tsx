"use client";

import { useContext, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Congela il router del segmento durante l'animazione di uscita: la pagina
 * vecchia resta visibile (com'era) mentre sfuma, poi entra la nuova.
 * Pattern standard per avere exit-animation nell'App Router.
 */
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const frozen = useRef(context).current;
  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Transizione tra pagine: la vecchia esce (dissolvenza + leggera salita),
 * la nuova entra (dissolvenza + salita). Header/footer restano fissi.
 * Funziona su ogni browser, indipendente dalle impostazioni di sistema.
 */
export function LayoutTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      // A uscita completata (pagina vecchia ormai invisibile) torniamo in
      // cima, così la nuova entra sempre dall'inizio senza salti visibili.
      onExitComplete={() => window.scrollTo(0, 0)}
    >
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
        transition={{
          duration: 0.5,
          ease: EASE,
          opacity: { duration: 0.4 },
        }}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
