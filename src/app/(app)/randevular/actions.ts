"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getActorEmail } from "@/lib/session";
import { logAudit } from "@/lib/audit";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

function revalidate() {
  revalidatePath("/randevular");
  revalidatePath("/takip-listesi");
}

export async function createAppointment(formData: FormData) {
  const title = str(formData, "title");
  const date = str(formData, "date");
  if (!title || !date) return;

  await prisma.appointment.create({
    data: {
      title,
      date,
      time: str(formData, "time") ?? null,
      note: str(formData, "note") ?? null,
      updatedByEmail: await getActorEmail(),
    },
  });
  await logAudit({ entity: "Appointment", action: "create", label: `${date} · ${title}` });

  revalidate();
}

export async function updateAppointment(id: string, formData: FormData) {
  const title = str(formData, "title");
  const date = str(formData, "date");
  if (!title || !date) return;

  await prisma.appointment.update({
    where: { id },
    data: {
      title,
      date,
      time: str(formData, "time") ?? null,
      note: str(formData, "note") ?? null,
      updatedByEmail: await getActorEmail(),
    },
  });
  await logAudit({ entity: "Appointment", action: "update", label: `${date} · ${title}` });

  revalidate();
}

export async function deleteAppointment(id: string) {
  const a = await prisma.appointment.findUnique({ where: { id } });
  await prisma.appointment.delete({ where: { id } });
  await logAudit({
    entity: "Appointment",
    action: "delete",
    label: a ? `${a.date} · ${a.title}` : undefined,
  });
  revalidate();
}

// Takip Listesi'nden gelen randevunun tarih/saatini takvim üzerinden değiştir.
export async function updateLeadAppointment(leadId: string, formData: FormData) {
  const date = str(formData, "date");
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      appointmentDate: date ?? null,
      appointmentTime: str(formData, "time") ?? null,
      updatedByEmail: await getActorEmail(),
    },
  });
  await logAudit({
    entity: "Lead",
    action: "update",
    label: `${lead.contactName ?? "?"} · randevu ${date ?? "kaldırıldı"}`,
  });
  revalidate();
}
