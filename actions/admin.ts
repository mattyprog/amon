"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Difesa in profondità: oltre al proxy, ogni azione riservata verifica
// di nuovo la sessione prima di toccare il database.
async function assertBarber() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    throw new Error("Non autorizzato");
  }
}

/** Annulla una prenotazione (la marca come cancellata, liberando lo slot). */
export async function cancelAppointment(formData: FormData): Promise<void> {
  await assertBarber();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.appointment.update({
    where: { id },
    data: { status: "cancelled" },
  });
  revalidatePath("/admin");
}

const blockSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().trim().max(120).optional(),
});

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Inserisce un blocco di indisponibilità (ferie, pausa, impegno). */
export async function addBlock(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  await assertBarber();
  const parsed = blockSchema.safeParse({
    date: formData.get("date"),
    start: formData.get("start"),
    end: formData.get("end"),
    reason: formData.get("reason") ?? "",
  });
  if (!parsed.success) return { error: "Dati del blocco non validi." };

  const startMin = toMin(parsed.data.start);
  const endMin = toMin(parsed.data.end);
  if (endMin <= startMin) {
    return { error: "L'orario di fine deve essere successivo all'inizio." };
  }

  await prisma.block.create({
    data: {
      date: parsed.data.date,
      startMin,
      endMin,
      reason: parsed.data.reason || null,
    },
  });
  revalidatePath("/admin");
  return {};
}

/** Rimuove un blocco. */
export async function removeBlock(formData: FormData): Promise<void> {
  await assertBarber();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.block.delete({ where: { id } });
  revalidatePath("/admin");
}
