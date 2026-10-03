"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { weekdayNameFromDate } from "@/lib/calendar";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

function num(formData: FormData, key: string) {
  const v = str(formData, key);
  return v ? Number(v) : undefined;
}

async function resolveTitle(formData: FormData, groupId?: string) {
  if (groupId) {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (group) return group.name;
  }

  const studentId = str(formData, "studentId");
  if (studentId) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (student) return student.name;
  }

  // Grup, öğrenci veya elle başlık girilmediyse dersin oluşturulmasını
  // engellemeyelim — genel bir başlıkla devam edelim.
  return str(formData, "title") ?? "Ders";
}

function dayFromDateStr(dateStr: string) {
  // "YYYY-MM-DD" -> yerel tarih (UTC kaymasını önlemek için parçalardan kur)
  const [y, m, d] = dateStr.split("-").map(Number);
  return weekdayNameFromDate(new Date(y, m - 1, d));
}

export async function createSession(formData: FormData) {
  const date = str(formData, "date");
  const time = str(formData, "time");
  const groupId = str(formData, "groupId");
  const title = await resolveTitle(formData, groupId);
  const recurring = str(formData, "recurring") === "on";

  if (!date || !time) throw new Error("Tarih ve saat zorunludur");

  await prisma.scheduleSession.create({
    data: {
      date,
      day: dayFromDateStr(date),
      time,
      recurring,
      title,
      groupId,
      courseId: str(formData, "courseId"),
      teacherId: str(formData, "teacherId"),
      durationHrs: num(formData, "durationHrs") ?? 1,
      note: str(formData, "note"),
    },
  });

  revalidatePath("/schedule");
}

export async function updateSession(sessionId: string, formData: FormData) {
  const date = str(formData, "date");
  const time = str(formData, "time");
  const groupId = str(formData, "groupId");
  const title = await resolveTitle(formData, groupId);
  const recurring = str(formData, "recurring") === "on";

  if (!date || !time) throw new Error("Tarih ve saat zorunludur");

  await prisma.scheduleSession.update({
    where: { id: sessionId },
    data: {
      date,
      day: dayFromDateStr(date),
      time,
      recurring,
      title,
      groupId: groupId ?? null,
      courseId: str(formData, "courseId") ?? null,
      teacherId: str(formData, "teacherId") ?? null,
      durationHrs: num(formData, "durationHrs") ?? 1,
      note: str(formData, "note") ?? null,
    },
  });

  revalidatePath("/schedule");
}

export async function deleteSession(id: string) {
  await prisma.scheduleSession.delete({ where: { id } });
  revalidatePath("/schedule");
}

export async function logLessonForSession(sessionId: string, dateISO: string) {
  const session = await prisma.scheduleSession.findUniqueOrThrow({
    where: { id: sessionId },
    include: { teacher: true, group: true, course: true },
  });
  if (!session.teacherId || !session.teacher) {
    throw new Error("Bu ders için önce bir öğretmen atayın");
  }

  // Bu tarih için zaten işlenmiş bir ders varsa tekrar ücret eklenmesin —
  // ders sadece işlenmiş/onaylanmış sayılır.
  const existing = await prisma.lesson.findFirst({
    where: { scheduleSessionId: session.id, date: dateISO },
  });
  if (existing) {
    revalidatePath("/schedule");
    revalidatePath("/teachers");
    revalidatePath(`/teachers/${session.teacherId}`);
    return;
  }

  const fee =
    session.teacher.rateType === "PerHour"
      ? session.teacher.rate * session.durationHrs
      : session.teacher.rate;

  await prisma.lesson.create({
    data: {
      teacherId: session.teacherId,
      scheduleSessionId: session.id,
      date: dateISO,
      day: session.day,
      time: session.time,
      groupLabel: session.group?.name ?? session.title,
      course: session.course?.name ?? session.title,
      durationHrs: session.durationHrs,
      fee,
    },
  });

  revalidatePath("/schedule");
  revalidatePath("/teachers");
  revalidatePath(`/teachers/${session.teacherId}`);
}

export async function deleteLoggedLesson(lessonId: string) {
  const lesson = await prisma.lesson.findUniqueOrThrow({ where: { id: lessonId } });
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath("/schedule");
  revalidatePath("/teachers");
  revalidatePath(`/teachers/${lesson.teacherId}`);
}
