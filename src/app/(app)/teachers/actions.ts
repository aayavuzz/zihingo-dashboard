"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function createTeacher(formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("İsim zorunludur");

  await prisma.teacher.create({
    data: {
      name,
      phone: str(formData, "phone"),
      photoUrl: str(formData, "photoUrl"),
      rateType: str(formData, "rateType") ?? "PerLesson",
      rate: num(formData, "rate") ?? 0,
      note: str(formData, "note"),
    },
  });
  await logAudit({ entity: "Teacher", action: "create", label: name });

  revalidatePath("/teachers");
  revalidatePath("/profil");
}

export async function updateTeacher(id: string, formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("İsim zorunludur");

  await prisma.teacher.update({
    where: { id },
    data: {
      name,
      phone: str(formData, "phone"),
      photoUrl: str(formData, "photoUrl") ?? null,
      rateType: str(formData, "rateType") ?? "PerLesson",
      rate: num(formData, "rate") ?? 0,
      note: str(formData, "note"),
      updatedByEmail: await getActorEmail(),
    },
  });
  await logAudit({ entity: "Teacher", action: "update", label: name });

  revalidatePath("/teachers");
  revalidatePath(`/teachers/${id}`);
  revalidatePath("/profil");
}

export async function deleteTeacher(id: string) {
  const teacher = await prisma.teacher.findUnique({ where: { id } });
  await prisma.teacher.delete({ where: { id } });
  await logAudit({ entity: "Teacher", action: "delete", label: teacher?.name });
  revalidatePath("/teachers");
  redirect("/teachers");
}

export async function addLesson(teacherId: string, formData: FormData) {
  const teacher = await prisma.teacher.findUniqueOrThrow({ where: { id: teacherId } });
  const durationHrs = num(formData, "durationHrs") ?? 1;
  const fee =
    teacher.rateType === "PerHour" ? teacher.rate * durationHrs : teacher.rate;

  const lesson = await prisma.lesson.create({
    data: {
      teacherId,
      date: str(formData, "date") ?? new Date().toISOString().slice(0, 10),
      day: str(formData, "day"),
      time: str(formData, "time"),
      groupLabel: str(formData, "groupLabel"),
      course: str(formData, "course"),
      durationHrs,
      fee,
      note: str(formData, "note"),
      updatedByEmail: await getActorEmail(),
    },
  });
  await logAudit({
    entity: "Lesson",
    action: "create",
    label: `${teacher.name} · ${lesson.date} · ${fee}₺`,
  });

  revalidatePath(`/teachers/${teacherId}`);
  revalidatePath("/teachers");
}

export async function updateLessonFee(lessonId: string, teacherId: string, formData: FormData) {
  const fee = num(formData, "fee");
  if (fee === undefined) return;

  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: { fee, updatedByEmail: await getActorEmail() },
    include: { teacher: true },
  });
  await logAudit({
    entity: "Lesson",
    action: "update",
    label: `${lesson.teacher.name} · ${lesson.date} · ücret: ${fee}₺`,
  });
  revalidatePath(`/teachers/${teacherId}`);
  revalidatePath("/teachers");
}

export async function toggleLessonPaid(lessonId: string, teacherId: string, paid: boolean) {
  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      paid,
      paidDate: paid ? new Date().toISOString().slice(0, 10) : null,
      updatedByEmail: await getActorEmail(),
    },
    include: { teacher: true },
  });
  await logAudit({
    entity: "Lesson",
    action: "update",
    label: `${lesson.teacher.name} · ${lesson.date} · ${paid ? "ödendi" : "ödenmedi"} işaretlendi`,
  });
  revalidatePath(`/teachers/${teacherId}`);
  revalidatePath("/teachers");
}

export async function deleteLesson(lessonId: string, teacherId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { teacher: true },
  });
  await prisma.lesson.delete({ where: { id: lessonId } });
  await logAudit({
    entity: "Lesson",
    action: "delete",
    label: lesson ? `${lesson.teacher.name} · ${lesson.date} · ${lesson.fee}₺` : undefined,
  });
  revalidatePath(`/teachers/${teacherId}`);
  revalidatePath("/teachers");
}
