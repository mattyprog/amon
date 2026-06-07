import { Link } from "next-view-transitions";
import { logout } from "@/actions/auth";
import { getCurrentUser } from "@/lib/session";
import { ensureSeeded } from "@/lib/seed";
import { Logo } from "@/components/Logo";

export default async function SettingsHome() {
  await ensureSeeded();
  const user = await getCurrentUser();

  const items = [
    {
      href: "/admin/impostazioni/servizi",
      title: "Servizi e prezzi",
      desc: "Aggiungi o modifica i servizi prenotabili.",
    },
    {
      href: "/admin/impostazioni/orari",
      title: "Orari di apertura",
      desc: "Imposta gli orari per ogni giorno.",
    },
    {
      href: "/admin/impostazioni/negozio",
      title: "Dati del negozio",
      desc: "Nome, indirizzo, telefono, Instagram.",
    },
    {
      href: "/admin/impostazioni/accessi",
      title: "Accessi",
      desc: "Password e account dei collaboratori.",
    },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Logo href="/admin" />
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:border-danger hover:text-danger"
            >
              Esci
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="font-display text-3xl text-ink">Impostazioni</h1>
        {user && (
          <p className="mt-1 text-sm text-muted">
            Accesso come <span className="text-ink">{user.name}</span> ·{" "}
            {user.role === "owner" ? "Titolare" : "Collaboratore"}
          </p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="rounded-xl border border-line bg-surface p-5 transition-colors hover:border-gold/60"
            >
              <h2 className="signage text-lg text-ink">{it.title}</h2>
              <p className="mt-1 text-sm text-muted">{it.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
