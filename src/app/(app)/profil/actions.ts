"use server";

import bcrypt from "bcryptjs";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession, issueSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

async function uploadPhotoIfPresent(formData: FormData, userId: string) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return undefined;

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const blob = await put(`profil/${userId}-${Date.now()}.${ext}`, file, {
    access: "public",
  });
  return blob.url;
}

export async function updateOwnProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return;

  const name = str(formData, "name") ?? null;
  const phone = str(formData, "phone") ?? null;
  const newPhotoUrl = await uploadPhotoIfPresent(formData, session.userId);

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { name, phone, ...(newPhotoUrl ? { photoUrl: newPhotoUrl } : {}) },
  });
  await logAudit({ entity: "User", action: "update", label: `${user.email} (kendi profili)` });

  // Sidebar'daki isim/fotoğraf anında güncellensin diye oturumu tazele.
  await issueSession(user);

  revalidatePath("/profil");
}

export async function createUser(formData: FormData) {
  const session = await getSession();
  if (session?.role !== "superadmin") throw new Error("Yetkiniz yok");

  const email = str(formData, "email")?.toLowerCase();
  const password = str(formData, "password");
  if (!email || !password) throw new Error("E-posta ve şifre zorunludur");

  const name = str(formData, "name") ?? null;
  const phone = str(formData, "phone") ?? null;
  const role = str(formData, "role") ?? "teacher";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, passwordHash, name, phone, role },
  });

  const newPhotoUrl = await uploadPhotoIfPresent(formData, user.id);
  if (newPhotoUrl) {
    await prisma.user.update({ where: { id: user.id }, data: { photoUrl: newPhotoUrl } });
  }

  await logAudit({ entity: "User", action: "create", label: `${email} (${role})` });

  revalidatePath("/profil");
}

export async function updateUserProfile(userId: string, formData: FormData) {
  const session = await getSession();
  if (session?.role !== "superadmin") throw new Error("Yetkiniz yok");

  const name = str(formData, "name") ?? null;
  const phone = str(formData, "phone") ?? null;
  const role = str(formData, "role") ?? "teacher";
  const newPassword = str(formData, "password");
  const newPhotoUrl = await uploadPhotoIfPresent(formData, userId);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      phone,
      role,
      ...(newPhotoUrl ? { photoUrl: newPhotoUrl } : {}),
      ...(newPassword ? { passwordHash: await bcrypt.hash(newPassword, 10) } : {}),
    },
  });
  await logAudit({
    entity: "User",
    action: "update",
    label: `${user.email} (superadmin tarafından düzenlendi)`,
  });

  revalidatePath("/profil");
}

export async function subscribeToPush(sub: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const session = await getSession();
  if (!session) return;

  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: {
      userId: session.userId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    update: {
      userId: session.userId,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
  });
}

export async function unsubscribeFromPush(endpoint: string) {
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
}
