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
      note: str(formData, "note"),
    },
  });

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
      note: str(formData, "note"),
    },
  });

  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
}

export async function deleteStudent(id: string) {
  await prisma.student.delete({ where: { id } });
  revalidatePath("/students");
  redirect("/students");
}

export async function addInstallment(studentId: string, formData: FormData) {
  const amount = num(formData, "amount") ?? 0;
  const lastIndex = await prisma.installment.count({ where: { studentId } });

  await prisma.installment.create({
    data: {
      studentId,
      index: lastIndex + 1,
      amount,
      status: str(formData, "status") ?? "Bekliyor",
      note: str(formData, "note"),
      paidDate: str(formData, "paidDate"),
    },
  });

  revalidatePath(`/students/${studentId}`);
  revalidatePath("/payments");
}

export async function updateInstallmentStatus(
  installmentId: string,
  studentId: string,
  status: string
) {
  await prisma.installment.update({
    where: { id: installmentId },
    data: { status },
  });
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/payments");
}

export async function updateInstallment(
  installmentId: string,
  studentId: string,
  formData: FormData
) {
  await prisma.installment.update({
    where: { id: installmentId },
    data: {
      amount: num(formData, "amount") ?? 0,
      status: str(formData, "status") ?? "Bekliyor",
      note: str(formData, "note") ?? null,
      paidDate: str(formData, "paidDate") ?? null,
    },
  });
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/payments");
}

export async function deleteInstallment(installmentId: string, studentId: string) {
  await prisma.installment.delete({ where: { id: installmentId } });
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

  await prisma.studentCourse.create({
    data: { studentId, courseId, status },
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
  await prisma.studentCourse.update({
    where: { id: studentCourseId },
    data: { status },
  });
  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
}

export async function removeStudentCourse(studentCourseId: string, studentId: string) {
  await prisma.studentCourse.delete({ where: { id: studentCourseId } });
  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
}
