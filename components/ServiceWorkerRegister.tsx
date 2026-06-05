"use client";

import { useEffect } from "react";

/** Registra il service worker che rende l'app installabile. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // In sviluppo può fallire: non è un problema.
      });
    }
  }, []);
  return null;
}
