import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { deleteUser } from "@/actions/admin";
import { ensureSeeded } from "@/lib/seed";
import { ConfirmButton } from "../../ConfirmButton";
import { ChangePasswordForm, CreateUserForm } from "./AccessForms";

export const metadata = { title: "Accessi" };

export default async function AccessSettings() {
  await ensureSeeded();
  const me = await getCurrentUser();
  const isOwner = me?.role === "owner";
  const users = isOwner
    ? await prisma.user.findMany({ orderBy: { createdAt: "asc" } })
    : [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link
        href="/admin/impostazioni"
        className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        ← Impostazioni
      </Link>
      <h1 className="mt-3 font-display text-3xl text-ink">Accessi</h1>

      {/* Cambio password personale */}
      <section className="mt-6">
        <h2 className="signage mb-3 text-base text-muted">La tua password</h2>
        <div className="rounded-xl border border-line bg-surface p-5">
          <ChangePasswordForm />
        </div>
      </section>

      {/* Gestione collaboratori (solo titolare) */}
      {isOwner && (
        <>
          <section className="mt-8">
            <h2 className="signage mb-3 text-base text-muted">Collaboratori</h2>
            <ul className="space-y-2">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3"
                >
                  <span className="text-sm">
                    <span className="font-semibold text-ink">{u.name}</span>{" "}
                    <span className="text-muted">@{u.username}</span>
                    <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">
                      {u.role === "owner" ? "Titolare" : "Collaboratore"}
                    </span>
                  </span>
                  {u.id !== me?.id && (
                    <form action={deleteUser}>
                      <input type="hidden" name="id" value={u.id} />
                      <ConfirmButton
                        confirm={`Revocare l'accesso a ${u.name}?`}
                        className="text-muted transition-colors hover:text-danger"
                      >
                        Revoca
                      </ConfirmButton>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="signage mb-3 text-base text-muted">
              Aggiungi collaboratore
            </h2>
            <div className="rounded-xl border border-line bg-surface p-5">
              <CreateUserForm />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
