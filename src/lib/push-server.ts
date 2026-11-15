import { setVapidDetails, sendNotification } from "web-push";
import { prisma } from "@/lib/db";

setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPushToAll(payload: { title: string; body: string; url?: string }) {
  const subs = await prisma.pushSubscription.findMany();
  const json = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (s) => {
      try {
        await sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          json
        );
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        // Abonelik artık geçersiz (kullanıcı bildirimi kapattı / cihazdan silindi).
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        }
      }
    })
  );
}
