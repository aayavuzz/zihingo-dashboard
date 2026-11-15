"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getActorEmail } from "@/lib/session";
import { logAudit } from "@/lib/audit";

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
  await logAudit({ entity: "Group", action: "create", label: name });

  revalidatePath("/groups");
  revalidatePath("/students");
  revalidatePath("/schedule");
}

export async function updateGroup(groupId: string, formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("Grup adı zorunludur");

  await prisma.group.update({
    where: { id: groupId },
    data: { name, note: str(formData, "note") ?? null, updatedByEmail: await getActorEmail() },
  });
  await logAudit({ entity: "Group", action: "update", label: name });

  revalidatePath("/groups");
  revalidatePath("/students");
  revalidatePath("/schedule");
}

export async function deleteGroup(groupId: string) {
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  await prisma.group.delete({ where: { id: groupId } });
  await logAudit({ entity: "Group", action: "delete", label: group?.name });
  revalidatePath("/groups");
  revalidatePath("/students");
  revalidatePath("/schedule");
}

export async function addStudentToGroup(groupId: string, formData: FormData) {
  const studentId = str(formData, "studentId");
  if (!studentId) return;

  const student = await prisma.student.update({
    where: { id: studentId },
    data: { groupId, updatedByEmail: await getActorEmail() },
    include: { group: true },
  });
  await logAudit({
    entity: "Student",
    action: "update",
    label: `${student.name} · gruba eklendi: ${student.group?.name ?? "?"}`,
  });

  revalidatePath("/groups");
  revalidatePath("/students");
}

export async function removeStudentFromGroup(studentId: string) {
  const student = await prisma.student.update({
    where: { id: studentId },
    data: { groupId: null, updatedByEmail: await getActorEmail() },
  });
  await logAudit({
    entity: "Student",
    action: "update",
    label: `${student.name} · gruptan çıkarıldı`,
  });

  revalidatePath("/groups");
  revalidatePath("/students");
}
