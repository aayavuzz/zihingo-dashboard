import { prisma } from "./db";
import { getActorEmail } from "./session";

export async function logAudit({
  entity,
  action,
  label,
}: {
  entity: string;
  action: "create" | "update" | "delete";
  label?: string | null;
}) {
  const actorEmail = await getActorEmail();
  await prisma.auditLog.create({
    data: { entity, action, label: label ?? null, actorEmail },
  });
}
