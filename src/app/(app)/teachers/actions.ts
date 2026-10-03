"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
      rateType: str(formData, "rateType") ?? "PerLesson",
      rate: num(formData, "rate") ?? 0,
      note: str(formData, "note"),
    },
  });

  revalidatePath("/teachers");
}

export async function updateTeacher(id: string, formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("İsim zorunludur");

  await prisma.teacher.update({
    where: { id },
    data: {
      name,
      phone: str(formData, "phone"),
      rateType: str(formData, "rateType") ?? "PerLesson",
      rate: num(formData, "rate") ?? 0,
      note: str(formData, "note"),
    },
  });

  revalidatePath("/teachers");
  revalidatePath(`/teachers/${id}`);
}

export async function deleteTeacher(id: string) {
  await prisma.teacher.delete({ where: { id } });
  revalidatePath("/teachers");
  redirect("/teachers");
}

export async function addLesson(teacherId: string, formData: FormData) {
  const teacher = await prisma.teacher.findUniqueOrThrow({ where: { id: teacherId } });
  const durationHrs = num(formData, "durationHrs") ?? 1;
  const fee =
    teacher.rateType === "PerHour" ? teacher.rate * durationHrs : teacher.rate;

  await prisma.lesson.create({
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
    },
  });

  revalidatePath(`/teachers/${teacherId}`);
  revalidatePath("/teachers");
}

export async function toggleLessonPaid(lessonId: string, teacherId: string, paid: boolean) {
  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      paid,
      paidDate: paid ? new Date().toISOString().slice(0, 10) : null,
    },
  });
  revalidatePath(`/teachers/${teacherId}`);
  revalidatePath("/teachers");
}

export async function deleteLesson(lessonId: string, teacherId: string) {
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/teachers/${teacherId}`);
  revalidatePath("/teachers");
}
