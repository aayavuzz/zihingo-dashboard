"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

function num(formData: FormData, key: string) {
  const v = str(formData, key);
  return v ? Number(v) : undefined;
}

export async function createLead(formData: FormData) {
  await prisma.lead.create({
    data: {
      type: str(formData, "type") ?? "Normal",
      contactName: str(formData, "contactName"),
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
      note: str(formData, "note"),
    },
  });

  revalidatePath("/takip-listesi");
}

export async function updateLead(id: string, formData: FormData) {
  await prisma.lead.update({
    where: { id },
    data: {
      type: str(formData, "type") ?? "Normal",
      contactName: str(formData, "contactName") ?? null,
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
      note: str(formData, "note") ?? null,
    },
  });

  revalidatePath("/takip-listesi");
}

export async function deleteLead(id: string) {
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/takip-listesi");
}
