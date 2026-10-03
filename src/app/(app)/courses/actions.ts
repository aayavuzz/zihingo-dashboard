"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

export async function createCourse(formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("Kur adı zorunludur");

  await prisma.course.create({
    data: {
      name,
      color: str(formData, "color") ?? "#502e9f",
      icon: str(formData, "icon") ?? "BookOpen",
    },
  });

  revalidatePath("/courses");
  revalidatePath("/students");
}

export async function updateCourse(courseId: string, formData: FormData) {
  const name = str(formData, "name");
  if (!name) throw new Error("Kur adı zorunludur");

  await prisma.course.update({
    where: { id: courseId },
    data: {
      name,
      color: str(formData, "color") ?? "#502e9f",
      icon: str(formData, "icon") ?? "BookOpen",
    },
  });

  revalidatePath("/courses");
  revalidatePath("/students");
}

export async function deleteCourse(courseId: string) {
  await prisma.course.delete({ where: { id: courseId } });
  revalidatePath("/courses");
  revalidatePath("/students");
}
