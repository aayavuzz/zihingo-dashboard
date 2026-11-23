"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getActorEmail } from "@/lib/session";
import { logAudit } from "@/lib/audit";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

function num(formData: FormData, key: string) {
  const v = str(formData, key);
  return v ? Number(v) : undefined;
}

export async function createLead(formData: FormData) {
  const contactName = str(formData, "contactName");
  const firstNote = str(formData, "note");
  const lead = await prisma.lead.create({
    data: {
      type: str(formData, "type") ?? "Normal",
      contactName,
      phone: str(formData, "phone"),
      status: str(formData, "status") ?? "Yeni",
      studentName: str(formData, "studentName"),
      age: num(formData, "age"),
      grade: str(formData, "grade"),
      school: str(formData, "school"),
      location: str(formData, "location"),
      firstContactDate: str(formData, "firstContactDate"),
      lastContactDate: str(formData, "lastContactDate"),
      appointmentDate: str(formData, "appointmentDate"),
      appointmentTime: str(formData, "appointmentTime"),
      callDate: str(formData, "callDate"),
      callTime: str(formData, "callTime"),
      callReminderSentAt: null,
      callOverdueSentAt: null,
      updatedByEmail: await getActorEmail(),
    },
  });

  if (firstNote) {
    await prisma.leadNote.create({
      data: {
        leadId: lead.id,
        date: str(formData, "noteDate") ?? new Date().toISOString().slice(0, 10),
        text: firstNote,
        createdByEmail: await getActorEmail(),
      },
    });
  }

  await logAudit({ entity: "Lead", action: "create", label: contactName });

  revalidatePath("/takip-listesi");
}

export async function updateLead(id: string, formData: FormData) {
  const contactName = str(formData, "contactName");
  await prisma.lead.update({
    where: { id },
    data: {
      type: str(formData, "type") ?? "Normal",
      contactName: contactName ?? null,
      phone: str(formData, "phone") ?? null,
      status: str(formData, "status") ?? "Yeni",
      studentName: str(formData, "studentName") ?? null,
      age: num(formData, "age") ?? null,
      grade: str(formData, "grade") ?? null,
      school: str(formData, "school") ?? null,
      location: str(formData, "location") ?? null,
      firstContactDate: str(formData, "firstContactDate") ?? null,
      lastContactDate: str(formData, "lastContactDate") ?? null,
      appointmentDate: str(formData, "appointmentDate") ?? null,
      appointmentTime: str(formData, "appointmentTime") ?? null,
      callDate: str(formData, "callDate") ?? null,
      callTime: str(formData, "callTime") ?? null,
      callReminderSentAt: null,
      callOverdueSentAt: null,
      updatedByEmail: await getActorEmail(),
    },
  });
  await logAudit({ entity: "Lead", action: "update", label: contactName });

  revalidatePath("/takip-listesi");
}

export async function addLeadNote(leadId: string, formData: FormData) {
  const text = str(formData, "text");
  if (!text) return;

  const date = str(formData, "date") ?? new Date().toISOString().slice(0, 10);
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });

  await prisma.leadNote.create({
    data: { leadId, date, text, createdByEmail: await getActorEmail() },
  });
  await logAudit({
    entity: "Lead",
    action: "update",
    label: `${lead?.contactName ?? "?"} · not eklendi (${date})`,
  });

  revalidatePath("/takip-listesi");
}

export async function deleteLeadNote(noteId: string) {
  const note = await prisma.leadNote.findUnique({
    where: { id: noteId },
    include: { lead: true },
  });
  await prisma.leadNote.delete({ where: { id: noteId } });
  await logAudit({
    entity: "Lead",
    action: "update",
    label: note ? `${note.lead.contactName ?? "?"} · not silindi (${note.date})` : undefined,
  });
  revalidatePath("/takip-listesi");
}

export async function deleteLead(id: string) {
  const lead = await prisma.lead.findUnique({ where: { id } });
  await prisma.lead.delete({ where: { id } });
  await logAudit({ entity: "Lead", action: "delete", label: lead?.contactName });
  revalidatePath("/takip-listesi");
}
