"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, requireOwner } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/password";
import { SHOP_FIELDS } from "@/lib/shop";

type FormState = { error?: string; ok?: boolean };

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// ----------------------- AGENDA: appuntamenti e blocchi --------------------

export async function cancelAppointment(formData: FormData): Promise<void> {
  await requireSession();
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

export async function addBlock(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();
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
  return { ok: true };
}

export async function removeBlock(formData: FormData): Promise<void> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.block.delete({ where: { id } });
  revalidatePath("/admin");
}

// ----------------------------- SERVIZI -------------------------------------

const serviceSchema = z.object({
  name: z.string().trim().min(1, "Nome obbligatorio").max(60),
  description: z.string().trim().max(200).optional(),
  durationMin: z.coerce.number().int().min(5).max(480),
  priceEuro: z.coerce.number().min(0).max(9999),
});

export async function saveService(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    durationMin: formData.get("durationMin"),
    priceEuro: formData.get("priceEuro"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }
  const data = {
    name: parsed.data.name,
    description: parsed.data.description || null,
    durationMin: parsed.data.durationMin,
    priceCents: Math.round(parsed.data.priceEuro * 100),
  };
  if (id) {
    await prisma.service.update({ where: { id }, data });
  } else {
    const count = await prisma.service.count();
    await prisma.service.create({ data: { ...data, sort: count } });
  }
  revalidatePath("/admin/impostazioni/servizi");
  revalidatePath("/");
  revalidatePath("/prenota");
  return { ok: true };
}

export async function deleteService(formData: FormData): Promise<void> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.service.delete({ where: { id } });
  revalidatePath("/admin/impostazioni/servizi");
  revalidatePath("/");
  revalidatePath("/prenota");
}

// ------------------------------ ORARI --------------------------------------

const timeRange = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;

/** Salva gli orari: un campo per giorno (es. "09:00-13:00, 15:00-19:00"). */
export async function saveHours(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();
  const rows: { weekday: number; startMin: number; endMin: number }[] = [];
  for (let wd = 0; wd < 7; wd++) {
    const raw = String(formData.get(`day_${wd}`) ?? "").trim();
    if (!raw) continue;
    for (const part of raw.split(",")) {
      const seg = part.trim().replace(/\s/g, "");
      if (!seg) continue;
      if (!timeRange.test(seg)) {
        return { error: `Formato non valido per il giorno: "${part.trim()}". Usa 09:00-13:00.` };
      }
      const [a, b] = seg.split("-");
      const startMin = toMin(a);
      const endMin = toMin(b);
      if (endMin <= startMin) {
        return { error: `Intervallo non valido: ${seg}` };
      }
      rows.push({ weekday: wd, startMin, endMin });
    }
  }
  await prisma.$transaction([
    prisma.openingHour.deleteMany({}),
    ...(rows.length ? [prisma.openingHour.createMany({ data: rows })] : []),
  ]);
  revalidatePath("/admin/impostazioni/orari");
  revalidatePath("/");
  revalidatePath("/prenota");
  return { ok: true };
}

// --------------------------- DATI NEGOZIO ----------------------------------

export async function saveShop(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();
  for (const f of SHOP_FIELDS) {
    const value = String(formData.get(f.key) ?? "").trim();
    await prisma.setting.upsert({
      where: { key: f.key },
      create: { key: f.key, value },
      update: { value },
    });
  }
  revalidatePath("/admin/impostazioni/negozio");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ------------------------------ UTENTI -------------------------------------

const userSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username troppo corto")
    .max(30)
    .regex(/^[a-z0-9._-]+$/, "Solo lettere, numeri, . _ -"),
  name: z.string().trim().min(1, "Nome obbligatorio").max(60),
  password: z.string().min(6, "Password di almeno 6 caratteri"),
  role: z.enum(["owner", "staff"]),
});

export async function createUser(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireOwner();
  const parsed = userSchema.safeParse({
    username: formData.get("username"),
    name: formData.get("name"),
    password: formData.get("password"),
    role: formData.get("role") ?? "staff",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }
  const exists = await prisma.user.findUnique({
    where: { username: parsed.data.username },
  });
  if (exists) return { error: "Username già in uso." };

  await prisma.user.create({
    data: {
      username: parsed.data.username,
      name: parsed.data.name,
      role: parsed.data.role,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });
  revalidatePath("/admin/impostazioni/accessi");
  return { ok: true };
}

export async function deleteUser(formData: FormData): Promise<void> {
  const session = await requireOwner();
  const id = String(formData.get("id") ?? "");
  if (!id || id === session.userId) return; // non puoi eliminare te stesso
  // Non lasciare il sistema senza titolari.
  const target = await prisma.user.findUnique({ where: { id } });
  if (target?.role === "owner") {
    const owners = await prisma.user.count({ where: { role: "owner" } });
    if (owners <= 1) return;
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/impostazioni/accessi");
}

const passwordSchema = z.object({
  current: z.string().min(1),
  next: z.string().min(6, "La nuova password deve avere almeno 6 caratteri"),
});

export async function changeOwnPassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !(await verifyPassword(parsed.data.current, user.passwordHash))) {
    return { error: "Password attuale errata." };
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.next) },
  });
  return { ok: true };
}
