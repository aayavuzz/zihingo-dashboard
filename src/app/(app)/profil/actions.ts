"use server";

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

export async function updateUserProfile(userId: string, formData: FormData) {
  const session = await getSession();
  if (session?.role !== "superadmin") throw new Error("Yetkiniz yok");

  const name = str(formData, "name") ?? null;
  const phone = str(formData, "phone") ?? null;
  const role = str(formData, "role") ?? "teacher";
  const newPhotoUrl = await uploadPhotoIfPresent(formData, userId);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, phone, role, ...(newPhotoUrl ? { photoUrl: newPhotoUrl } : {}) },
  });
  await logAudit({
    entity: "User",
    action: "update",
    label: `${user.email} (superadmin tarafından düzenlendi)`,
  });

  revalidatePath("/profil");
}
