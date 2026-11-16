import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseTurkeyDateTime, turkeyDateStr, turkeyTimeStr, turkeyWeekdayMon0 } from "@/lib/time";
import { WEEKDAYS_TR } from "@/lib/calendar";
import { sendPushToAll } from "@/lib/push-server";

export const dynamic = "force-dynamic";

async function checkDailyScheduleReminder() {
  const todayDateStr = turkeyDateStr();
  const todayDayName = WEEKDAYS_TR[turkeyWeekdayMon0()];
  const todayTimeStr = turkeyTimeStr();
  const isWeekend = todayDayName === "Cumartesi" || todayDayName === "Pazar";
  const targetTime = isWeekend ? "09:30" : "10:00";

  if (todayTimeStr < targetTime) return { sent: false, reason: "too-early" as const };

  const log = await prisma.dailyReminderLog.findUnique({ where: { key: "schedule-today" } });
  if (log?.lastDate === todayDateStr) return { sent: false, reason: "already-checked" as const };

  const sessions = await prisma.scheduleSession.findMany({
    where: { OR: [{ date: todayDateStr }, { recurring: true, day: todayDayName }] },
    orderBy: { time: "asc" },
  });

  let sent = false;
  if (sessions.length > 0) {
    const titles = sessions.slice(0, 3).map((s) => s.title).join(", ");
    const more = sessions.length > 3 ? ` +${sessions.length - 3} ders daha` : "";
    await sendPushToAll({
      title: "Bugünün ders programı",
      body: `${sessions.length} ders var: ${titles}${more}`,
      url: "/schedule",
    });
    sent = true;
  }

  await prisma.dailyReminderLog.upsert({
    where: { key: "schedule-today" },
    create: { key: "schedule-today", lastDate: todayDateStr },
    update: { lastDate: todayDateStr },
  });

  return { sent, reason: "checked" as const, lessonCount: sessions.length };
}

// Dışarıdan (GitHub Actions) 5 dakikada bir tetiklenir. Vercel Hobby planında
// cron job'lar günde 1 kezle sınırlı olduğu için bu kontrolü GitHub Actions
// üstünden yapıyoruz.
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dailySchedule = await checkDailyScheduleReminder();

  const now = new Date();
  const windowEnd = new Date(now.getTime() + 5 * 60 * 1000);

  const leads = await prisma.lead.findMany({
    where: {
      status: "Aranacak",
      callDate: { not: null },
      callTime: { not: null },
      OR: [{ callReminderSentAt: null }, { callOverdueSentAt: null }],
    },
  });

  let upcomingNotified = 0;
  let overdueNotified = 0;

  for (const lead of leads) {
    const callAt = parseTurkeyDateTime(lead.callDate!, lead.callTime!);
    if (!callAt) continue;

    const name = lead.contactName ?? lead.studentName ?? "Bilinmeyen kişi";

    if (!lead.callReminderSentAt && callAt > now && callAt <= windowEnd) {
      await sendPushToAll({
        title: "Arama zamanı yaklaşıyor",
        body: `${name} — ${lead.callTime}'da aranacak`,
        url: "/takip-listesi?tab=tumu&status=Aranacak",
      });
      await prisma.lead.update({ where: { id: lead.id }, data: { callReminderSentAt: now } });
      upcomingNotified++;
    } else if (!lead.callOverdueSentAt && callAt <= now) {
      await sendPushToAll({
        title: "Arama saati geçti",
        body: `${name} — ${lead.callTime}'da aranması gerekiyordu`,
        url: "/takip-listesi?tab=tumu&status=Aranacak",
      });
      await prisma.lead.update({ where: { id: lead.id }, data: { callOverdueSentAt: now } });
      overdueNotified++;
    }
  }

  return NextResponse.json({
    checked: leads.length,
    upcomingNotified,
    overdueNotified,
    dailySchedule,
  });
}
