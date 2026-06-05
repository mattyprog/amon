import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Accesso barbiere",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo href="/" />
        </div>
        <div className="rounded-lg border border-line bg-surface p-8">
          <h1 className="signage text-center text-xl text-ink">Area barbiere</h1>
          <p className="mt-2 text-center text-sm text-muted">
            Inserisci la password per gestire le prenotazioni.
          </p>
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm">
          <a href="/" className="text-muted underline-offset-4 hover:text-ink hover:underline">
            ← Torna al sito
          </a>
        </p>
      </div>
    </main>
  );
}
