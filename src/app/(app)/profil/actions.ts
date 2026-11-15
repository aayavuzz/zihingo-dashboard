"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession, issueSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

export async function updateOwnProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return;

  const name = str(formData, "name") ?? null;
  const phone = str(formData, "phone") ?? null;
  const photoUrl = str(formData, "photoUrl") ?? null;

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { name, phone, photoUrl },
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
  const photoUrl = str(formData, "photoUrl") ?? null;
  const role = str(formData, "role") ?? "teacher";

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, phone, photoUrl, role },
  });
  await logAudit({
    entity: "User",
    action: "update",
    label: `${user.email} (superadmin tarafından düzenlendi)`,
  });

  revalidatePath("/profil");
}
