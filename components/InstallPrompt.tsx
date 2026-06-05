"use client";

import { useEffect, useState } from "react";

type BIPEvent = Event & { prompt: () => Promise<void> };

/** Banner per installare l'app gestionale sul telefono. */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Già installata? Non mostrare nulla.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    if (sessionStorage.getItem("amon-install-dismissed")) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);
    if (ios) {
      setShow(true);
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("amon-install-dismissed", "1");
  };

  return (
    <div className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-md rounded-xl border border-gold/40 bg-surface-2 p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex-1 text-sm">
          <p className="font-semibold text-ink">Installa l&apos;app Agenda</p>
          {isIOS ? (
            <p className="mt-1 text-muted">
              Tocca <span className="text-ink">Condividi</span> e poi{" "}
              <span className="text-ink">Aggiungi a Home</span> per avere
              l&apos;icona AMON.
            </p>
          ) : (
            <p className="mt-1 text-muted">
              Aggiungila alla schermata Home per aprirla come un&apos;app.
            </p>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Chiudi"
          className="text-muted hover:text-ink"
        >
          ✕
        </button>
      </div>
      {!isIOS && deferred && (
        <button
          onClick={async () => {
            await deferred.prompt();
            dismiss();
          }}
          className="mt-3 w-full rounded-md bg-gold py-2 text-sm font-semibold text-bg hover:bg-gold-soft"
        >
          Installa
        </button>
      )}
    </div>
  );
}
