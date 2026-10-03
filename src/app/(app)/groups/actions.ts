"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

export async function createGroup(formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("Grup adı zorunludur");

  await prisma.group.create({
    data: { name, note: str(formData, "note") },
  });

  revalidatePath("/groups");
  revalidatePath("/students");
  revalidatePath("/schedule");
}

export async function updateGroup(groupId: string, formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("Grup adı zorunludur");

  await prisma.group.update({
    where: { id: groupId },
    data: { name, note: str(formData, "note") ?? null },
  });

  revalidatePath("/groups");
  revalidatePath("/students");
  revalidatePath("/schedule");
}

export async function deleteGroup(groupId: string) {
  await prisma.group.delete({ where: { id: groupId } });
  revalidatePath("/groups");
  revalidatePath("/students");
  revalidatePath("/schedule");
}

export async function addStudentToGroup(groupId: string, formData: FormData) {
  const studentId = str(formData, "studentId");
  if (!studentId) return;

  await prisma.student.update({
    where: { id: studentId },
    data: { groupId },
  });

  revalidatePath("/groups");
  revalidatePath("/students");
}

export async function removeStudentFromGroup(studentId: string) {
  await prisma.student.update({
    where: { id: studentId },
    data: { groupId: null },
  });

  revalidatePath("/groups");
  revalidatePath("/students");
}
