import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseTurkeyDateTime } from "@/lib/time";
import { sendPushToAll } from "@/lib/push-server";

export const dynamic = "force-dynamic";

// Dışarıdan (GitHub Actions) 5 dakikada bir tetiklenir. Vercel Hobby planında
// cron job'lar günde 1 kezle sınırlı olduğu için bu kontrolü GitHub Actions
// üstünden yapıyoruz.
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const windowEnd = new Date(now.getTime() + 5 * 60 * 1000);

  const leads = await prisma.lead.findMany({
    where: {
      status: "Aranacak",
      callReminderSentAt: null,
      callDate: { not: null },
      callTime: { not: null },
    },
  });

  let notified = 0;
  for (const lead of leads) {
    const callAt = parseTurkeyDateTime(lead.callDate!, lead.callTime!);
    if (!callAt || callAt <= now || callAt > windowEnd) continue;

    const name = lead.contactName ?? lead.studentName ?? "Bilinmeyen kişi";
    await sendPushToAll({
      title: "Arama zamanı yaklaşıyor",
      body: `${name} — ${lead.callTime}'da aranacak`,
      url: "/takip-listesi?tab=tumu&status=Aranacak",
    });
    await prisma.lead.update({ where: { id: lead.id }, data: { callReminderSentAt: now } });
    notified++;
  }

  return NextResponse.json({ checked: leads.length, notified });
}
