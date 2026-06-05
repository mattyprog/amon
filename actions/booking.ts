"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getService, shop } from "@/lib/shop";
import { getAvailableSlots, getBusyIntervals, overlaps } from "@/lib/availability";
import {
  todayInShop,
  addDays,
  nowMinutesInShop,
} from "@/lib/time";

/** Orari disponibili per un servizio in un dato giorno (chiamata dal form). */
export async function fetchSlots(serviceId: string, date: string): Promise<number[]> {
  const service = getService(serviceId);
  if (!service) return [];
  // Non permettere date fuori dalla finestra di prenotazione.
  const today = todayInShop();
  const last = addDays(today, shop.bookingHorizonDays);
  if (date < today || date > last) return [];
  return getAvailableSlots(date, service.durationMin);
}

const bookingSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data non valida"),
  startMin: z.coerce.number().int().min(0).max(24 * 60),
  name: z.string().trim().min(2, "Inserisci il tuo nome").max(80),
  phone: z
    .string()
    .trim()
    .min(6, "Inserisci un numero di telefono valido")
    .max(30)
    .regex(/^[+0-9 ()/-]+$/, "Numero di telefono non valido"),
  email: z.union([z.literal(""), z.email("Email non valida")]).optional(),
  notes: z.string().trim().max(300).optional(),
});

export type BookingResult =
  | {
      ok: true;
      appointment: {
        serviceName: string;
        date: string;
        startMin: number;
        endMin: number;
      };
    }
  | { ok: false; error: string };

/**
 * Crea una prenotazione. La disponibilità viene SEMPRE ricalcolata lato
 * server appena prima di scrivere, così due clienti non possono prenotare
 * lo stesso slot anche se la pagina mostrava entrambi disponibili.
 */
export async function createBooking(formData: FormData): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse({
    serviceId: formData.get("serviceId"),
    date: formData.get("date"),
    startMin: formData.get("startMin"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dati non validi",
    };
  }

  const data = parsed.data;
  const service = getService(data.serviceId);
  if (!service) return { ok: false, error: "Servizio non valido" };

  // Validazioni temporali.
  const today = todayInShop();
  const last = addDays(today, shop.bookingHorizonDays);
  if (data.date < today || data.date > last) {
    return { ok: false, error: "Data fuori dal periodo prenotabile" };
  }
  if (data.date === today && data.startMin <= nowMinutesInShop()) {
    return { ok: false, error: "Questo orario è già passato" };
  }

  const slot = { startMin: data.startMin, endMin: data.startMin + service.durationMin };

  // Controllo anti-collisione appena prima dell'inserimento.
  const busy = await getBusyIntervals(data.date);
  if (busy.some((b) => overlaps(slot, b))) {
    return {
      ok: false,
      error: "Spiacenti, questo orario è appena stato occupato. Scegline un altro.",
    };
  }
  // Lo slot deve anche cadere effettivamente in un orario di apertura.
  const valid = await getAvailableSlots(data.date, service.durationMin);
  if (!valid.includes(data.startMin)) {
    return { ok: false, error: "Orario non disponibile. Scegline un altro." };
  }

  await prisma.appointment.create({
    data: {
      serviceId: service.id,
      serviceName: service.name,
      durationMin: service.durationMin,
      priceCents: service.priceCents,
      customerName: data.name,
      customerPhone: data.phone,
      customerEmail: data.email || null,
      notes: data.notes || null,
      date: data.date,
      startMin: slot.startMin,
      endMin: slot.endMin,
      status: "confirmed",
    },
  });

  return {
    ok: true,
    appointment: {
      serviceName: service.name,
      date: data.date,
      startMin: slot.startMin,
      endMin: slot.endMin,
    },
  };
}
