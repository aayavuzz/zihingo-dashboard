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

export async function createStudent(formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("İsim zorunludur");

  await prisma.student.create({
    data: {
      name,
      status: str(formData, "status") ?? "Aktif",
      age: num(formData, "age"),
      grade: str(formData, "grade"),
      startDate: str(formData, "startDate"),
      lessonDay: str(formData, "lessonDay"),
      lessonTime: str(formData, "lessonTime"),
      groupId: str(formData, "groupId"),
      birthday: str(formData, "birthday"),
      parentName: str(formData, "parentName"),
      parentPhone: str(formData, "parentPhone"),
      isPreschool: str(formData, "isPreschool") === "on",
      note: str(formData, "note"),
    },
  });
  await logAudit({ entity: "Student", action: "create", label: name });

  revalidatePath("/students");
}

export async function updateStudent(id: string, formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("İsim zorunludur");

  await prisma.student.update({
    where: { id },
    data: {
      name,
      status: str(formData, "status") ?? "Aktif",
      age: num(formData, "age"),
      grade: str(formData, "grade"),
      startDate: str(formData, "startDate"),
      lessonDay: str(formData, "lessonDay"),
      lessonTime: str(formData, "lessonTime"),
      groupId: str(formData, "groupId") ?? null,
      birthday: str(formData, "birthday"),
      parentName: str(formData, "parentName") ?? null,
      parentPhone: str(formData, "parentPhone") ?? null,
      isPreschool: str(formData, "isPreschool") === "on",
      note: str(formData, "note"),
      updatedByEmail: await getActorEmail(),
    },
  });
  await logAudit({ entity: "Student", action: "update", label: name });

  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
}

export async function deleteStudent(id: string) {
  const student = await prisma.student.findUnique({ where: { id } });
  await prisma.student.delete({ where: { id } });
  await logAudit({ entity: "Student", action: "delete", label: student?.name });
  revalidatePath("/students");
  redirect("/students");
}

export async function addInstallment(studentId: string, formData: FormData) {
  const amount = num(formData, "amount") ?? 0;
  const lastIndex = await prisma.installment.count({ where: { studentId } });
  const student = await prisma.student.findUnique({ where: { id: studentId } });

  await prisma.installment.create({
    data: {
      studentId,
      index: lastIndex + 1,
      amount,
      status: str(formData, "status") ?? "Bekliyor",
      paidAmount: num(formData, "paidAmount"),
      note: str(formData, "note"),
      paidDate: str(formData, "paidDate"),
      updatedByEmail: await getActorEmail(),
    },
  });
  await logAudit({
    entity: "Installment",
    action: "create",
    label: `${student?.name ?? "?"} · ${lastIndex + 1}. Kur · ${amount}₺`,
  });

  revalidatePath(`/students/${studentId}`);
  revalidatePath("/payments");
}

export async function updateInstallmentStatus(
  installmentId: string,
  studentId: string,
  status: string
) {
  const inst = await prisma.installment.update({
    where: { id: installmentId },
    data: { status, updatedByEmail: await getActorEmail() },
    include: { student: true },
  });
  await logAudit({
    entity: "Installment",
    action: "update",
    label: `${inst.student.name} · ${inst.index}. Kur · durum: ${status}`,
  });
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/payments");
}

export async function updateInstallment(
  installmentId: string,
  studentId: string,
  formData: FormData
) {
  const status = str(formData, "status") ?? "Bekliyor";
  const inst = await prisma.installment.update({
    where: { id: installmentId },
    data: {
      amount: num(formData, "amount") ?? 0,
      status,
      paidAmount: status === "KismiOdendi" ? (num(formData, "paidAmount") ?? 0) : null,
      note: str(formData, "note") ?? null,
      paidDate: str(formData, "paidDate") ?? null,
      updatedByEmail: await getActorEmail(),
    },
    include: { student: true },
  });
  await logAudit({
    entity: "Installment",
    action: "update",
    label: `${inst.student.name} · ${inst.index}. Kur · ${inst.amount}₺`,
  });
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/payments");
}

export async function deleteInstallment(installmentId: string, studentId: string) {
  const inst = await prisma.installment.findUnique({
    where: { id: installmentId },
    include: { student: true },
  });
  await prisma.installment.delete({ where: { id: installmentId } });
  await logAudit({
    entity: "Installment",
    action: "delete",
    label: inst ? `${inst.student.name} · ${inst.index}. Kur · ${inst.amount}₺` : undefined,
  });
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/payments");
}

export async function addStudentCourse(studentId: string, formData: FormData) {
  const courseId = str(formData, "courseId");
  if (!courseId) return;
  const status = str(formData, "status") ?? "Tamamlandi";

  // Yeni eklenen "Aktif" kabul edilirse, önceki aktif kursu otomatik tamamlandı yap
  if (status === "Aktif") {
    await prisma.studentCourse.updateMany({
      where: { studentId, status: "Aktif" },
      data: { status: "Tamamlandi" },
    });
  }

  const sc = await prisma.studentCourse.create({
    data: { studentId, courseId, status },
    include: { student: true, course: true },
  });
  await logAudit({
    entity: "StudentCourse",
    action: "create",
    label: `${sc.student.name} · ${sc.course.name}`,
  });

  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
}

export async function updateStudentCourseStatus(
  studentCourseId: string,
  studentId: string,
  status: string
) {
  if (status === "Aktif") {
    await prisma.studentCourse.updateMany({
      where: { studentId, status: "Aktif" },
      data: { status: "Tamamlandi" },
    });
  }
  const sc = await prisma.studentCourse.update({
    where: { id: studentCourseId },
    data: { status, updatedByEmail: await getActorEmail() },
    include: { student: true, course: true },
  });
  await logAudit({
    entity: "StudentCourse",
    action: "update",
    label: `${sc.student.name} · ${sc.course.name} · durum: ${status}`,
  });
  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
}

export async function removeStudentCourse(studentCourseId: string, studentId: string) {
  const sc = await prisma.studentCourse.findUnique({
    where: { id: studentCourseId },
    include: { student: true, course: true },
  });
  await prisma.studentCourse.delete({ where: { id: studentCourseId } });
  await logAudit({
    entity: "StudentCourse",
    action: "delete",
    label: sc ? `${sc.student.name} · ${sc.course.name}` : undefined,
  });
  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
}
