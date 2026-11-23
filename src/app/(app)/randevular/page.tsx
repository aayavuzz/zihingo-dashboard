import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { Badge, Button, Card, LastEditedBy, inputClass, labelClass } from "@/components/ui";
import {
  MONTHS_TR,
  WEEKDAYS_SHORT_TR,
  formatISODate,
  getMonthGridWeeks,
  getWeekDates,
  isSameDate,
  weekdayNameFromDate,
} from "@/lib/calendar";
import {
  createAppointment,
  deleteAppointment,
  updateAppointment,
  updateLeadAppointment,
} from "./actions";

export const dynamic = "force-dynamic";

type View = "day" | "week" | "month";

// Takvimde gösterilen tek bir randevu — ya serbest kayıt ya da Takip
// Listesi'ndeki bir talebin randevusu.
type ApptItem = {
  id: string;
  source: "free" | "lead";
  date: string;
  time: string | null;
  title: string;
  note: string | null;
  leadStatus?: string;
  updatedByEmail?: string | null;
  updatedAt?: Date;
};

// Talep kayıtlarında tarih "2026-11-22" ya da eski kayıtlarda "22.11.2026"
// olabiliyor; hepsini ISO'ya çeviriyoruz.
function toISO(dateStr?: string | null): string {
  if (!dateStr) return "";
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const tr = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(dateStr.trim());
  if (tr) return `${tr[3]}-${tr[2].padStart(2, "0")}-${tr[1].padStart(2, "0")}`;
  return "";
}

// "15.00" gibi girilmiş saatleri de "15:00" olarak göster.
function normalizeTime(t?: string | null): string | null {
  if (!t?.trim()) return null;
  const m = /^(\d{1,2})[.:](\d{2})$/.exec(t.trim());
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : t.trim();
}

function sortByTime(a: ApptItem, b: ApptItem) {
  if (!a.time && !b.time) return a.title.localeCompare(b.title, "tr");
  if (!a.time) return 1;
  if (!b.time) return -1;
  return a.time.localeCompare(b.time);
}

function hrefFor(view: View, date: Date) {
  const p = new URLSearchParams();
  p.set("view", view);
  p.set("y", String(date.getFullYear()));
  p.set("m", String(date.getMonth() + 1));
  p.set("d", String(date.getDate()));
  return `/randevular?${p.toString()}`;
}

function shiftDate(date: Date, view: View, dir: number) {
  const d = new Date(date);
  if (view === "month") d.setMonth(d.getMonth() + dir);
  else if (view === "week") d.setDate(d.getDate() + 7 * dir);
  else d.setDate(d.getDate() + dir);
  return d;
}

export default async function RandevularPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; y?: string; m?: string; d?: string }>;
}) {
  const sp = await searchParams;
  const view: View = sp.view === "day" || sp.view === "week" ? sp.view : "month";

  const today = new Date();
  const y = Number(sp.y) || today.getFullYear();
  const m = (Number(sp.m) || today.getMonth() + 1) - 1;
  const d = Number(sp.d) || today.getDate();
  const refDate = new Date(y, m, d);

  const [appointments, leads] = await Promise.all([
    prisma.appointment.findMany({ orderBy: { date: "asc" } }),
    prisma.lead.findMany({
      where: { appointmentDate: { not: null } },
      select: {
        id: true,
        contactName: true,
        studentName: true,
        phone: true,
        status: true,
        appointmentDate: true,
        appointmentTime: true,
      },
    }),
  ]);

  const items: ApptItem[] = [
    ...appointments.map((a) => ({
      id: a.id,
      source: "free" as const,
      date: toISO(a.date),
      time: normalizeTime(a.time),
      title: a.title,
      note: a.note,
      updatedByEmail: a.updatedByEmail,
      updatedAt: a.updatedAt,
    })),
    ...leads
      .map((l) => ({
        id: l.id,
        source: "lead" as const,
        date: toISO(l.appointmentDate),
        time: normalizeTime(l.appointmentTime),
        title: l.contactName ?? l.studentName ?? "İsimsiz talep",
        note: [l.studentName && `Öğrenci: ${l.studentName}`, l.phone].filter(Boolean).join(" · ") || null,
        leadStatus: l.status,
      }))
      .filter((i) => i.date),
  ];

  const byDate = new Map<string, ApptItem[]>();
  for (const it of items) {
    if (!it.date) continue;
    const arr = byDate.get(it.date) ?? [];
    arr.push(it);
    byDate.set(it.date, arr);
  }
  for (const arr of byDate.values()) arr.sort(sortByTime);

  const itemsForDate = (date: Date) => byDate.get(formatISODate(date)) ?? [];

  const prevHref = hrefFor(view, shiftDate(refDate, view, -1));
  const nextHref = hrefFor(view, shiftDate(refDate, view, 1));
  const todayHref = hrefFor(view, today);

  let title: string;
  if (view === "month") title = `${MONTHS_TR[m]} ${y}`;
  else if (view === "day")
    title = `${d} ${MONTHS_TR[m]} ${y} · ${weekdayNameFromDate(refDate)}`;
  else {
    const week = getWeekDates(y, m, d);
    const [start, end] = [week[0], week[6]];
    title =
      start.getMonth() === end.getMonth()
        ? `${start.getDate()} - ${end.getDate()} ${MONTHS_TR[start.getMonth()]} ${start.getFullYear()}`
        : `${start.getDate()} ${MONTHS_TR[start.getMonth()]} - ${end.getDate()} ${MONTHS_TR[end.getMonth()]} ${end.getFullYear()}`;
  }

  const upcoming = items
    .filter((i) => i.date >= formatISODate(today))
    .sort((a, b) => (a.date === b.date ? sortByTime(a, b) : a.date.localeCompare(b.date)))
    .slice(0, 5);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <details className="relative">
          <summary className="list-none">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 text-white px-3.5 py-2 text-sm font-medium cursor-pointer hover:bg-brand-700 transition-colors">
              <Plus size={16} /> Randevu Ekle
            </span>
          </summary>
          <Card className="absolute left-0 mt-2 w-80 max-w-[calc(100vw-2rem)] p-4 z-20">
            <form action={createAppointment} className="space-y-3">
              <div>
                <label className={labelClass}>Başlık *</label>
                <input
                  name="title"
                  required
                  placeholder="Örn: Veli görüşmesi — Ahmet"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Tarih *</label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={formatISODate(refDate)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Saat</label>
                  <input type="time" name="time" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Not</label>
                <textarea name="note" rows={2} className={`${inputClass} resize-y`} />
              </div>
              <Button variant="primary" className="w-full">
                Ekle
              </Button>
            </form>
          </Card>
        </details>

        <div className="flex items-center gap-1 bg-white ring-1 ring-slate-200 rounded-lg p-1 self-start">
          {(["day", "week", "month"] as View[]).map((v) => (
            <Link
              key={v}
              href={hrefFor(v, refDate)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === v ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {v === "day" ? "Gün" : v === "week" ? "Hafta" : "Ay"}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-5">
        <h1 className="text-[1.35rem] font-bold text-slate-900 tracking-tight">{title}</h1>
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href={todayHref}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Bugün
          </Link>
          <Link
            href={prevHref}
            className="w-8 h-8 rounded-lg bg-white ring-1 ring-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center"
          >
            <ChevronLeft size={16} />
          </Link>
          <Link
            href={nextHref}
            className="w-8 h-8 rounded-lg bg-white ring-1 ring-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center"
          >
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {view === "month" && (
        <MonthView year={y} month={m} today={today} itemsForDate={itemsForDate} />
      )}
      {view === "week" && (
        <WeekView year={y} month={m} day={d} today={today} itemsForDate={itemsForDate} />
      )}
      {view === "day" && <DayView date={refDate} today={today} itemsForDate={itemsForDate} />}

      {upcoming.length > 0 && (
        <Card className="mt-5 p-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Yaklaşan Randevular
          </h2>
          <div className="space-y-1.5">
            {upcoming.map((it) => (
              <div
                key={`${it.source}-${it.id}`}
                className="flex items-center gap-3 text-sm px-2 py-1.5 rounded-lg hover:bg-slate-50"
              >
                <span className="text-xs text-slate-500 tabular-nums w-24 shrink-0">
                  {it.date.slice(8, 10)}.{it.date.slice(5, 7)}.{it.date.slice(0, 4)}
                </span>
                <span className="text-xs font-medium text-brand-600 tabular-nums w-12 shrink-0">
                  {it.time ?? "—"}
                </span>
                <span className="flex-1 truncate text-slate-700">{it.title}</span>
                {it.leadStatus && <Badge value={it.leadStatus} />}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function ApptChip({ item, compact = false }: { item: ApptItem; compact?: boolean }) {
  const tone =
    item.source === "lead"
      ? "bg-violet-50 text-violet-700 ring-violet-600/15 hover:bg-violet-100"
      : "bg-brand-50 text-brand-700 ring-brand-600/15 hover:bg-brand-100";

  return (
    <details className="relative group/appt">
      <summary className="list-none cursor-pointer">
        <span
          className={`block truncate rounded-md ring-1 px-1.5 py-0.5 text-[11px] font-medium transition-colors ${tone}`}
        >
          {item.time && <span className="tabular-nums opacity-80">{item.time} </span>}
          {item.title}
        </span>
      </summary>

      <Card
        className={`absolute left-0 ${compact ? "mt-1" : "mt-1.5"} w-72 max-w-[calc(100vw-2rem)] p-3.5 z-30 text-left`}
      >
        {item.source === "lead" ? (
          <>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <div className="font-semibold text-sm text-slate-800 truncate">{item.title}</div>
                {item.note && <div className="text-xs text-slate-500 mt-0.5">{item.note}</div>}
              </div>
              {item.leadStatus && <Badge value={item.leadStatus} />}
            </div>
            <div className="text-[11px] text-violet-700 bg-violet-50 rounded-md px-2 py-1 mb-2.5">
              Takip Listesi&apos;nden geliyor
            </div>
            <form action={updateLeadAppointment.bind(null, item.id)} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Tarih</label>
                  <input type="date" name="date" defaultValue={item.date} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Saat</label>
                  <input
                    type="time"
                    name="time"
                    defaultValue={item.time ?? ""}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="primary" className="flex-1">
                  Kaydet
                </Button>
                <Link
                  href="/takip-listesi"
                  className="text-xs text-brand-600 hover:underline shrink-0"
                >
                  Talebi aç →
                </Link>
              </div>
            </form>
          </>
        ) : (
          <>
            <form action={updateAppointment.bind(null, item.id)} className="space-y-2.5">
              <div>
                <label className={labelClass}>Başlık</label>
                <input name="title" defaultValue={item.title} required className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Tarih</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={item.date}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Saat</label>
                  <input
                    type="time"
                    name="time"
                    defaultValue={item.time ?? ""}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Not</label>
                <textarea
                  name="note"
                  rows={2}
                  defaultValue={item.note ?? ""}
                  className={`${inputClass} resize-y`}
                />
              </div>
              <Button variant="primary" className="w-full">
                Kaydet
              </Button>
            </form>
            <form action={deleteAppointment.bind(null, item.id)} className="mt-2">
              <button className="text-xs text-rose-500 hover:underline">Randevuyu Sil</button>
            </form>
            <div className="mt-2">
              <LastEditedBy email={item.updatedByEmail} date={item.updatedAt} />
            </div>
          </>
        )}
      </Card>
    </details>
  );
}

function MonthView({
  year,
  month,
  today,
  itemsForDate,
}: {
  year: number;
  month: number;
  today: Date;
  itemsForDate: (d: Date) => ApptItem[];
}) {
  const weeks = getMonthGridWeeks(year, month);
  const lastRow = weeks.length - 1;
  return (
    <Card className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-7 bg-slate-50/80 border-b border-slate-200 rounded-t-xl">
          {WEEKDAYS_SHORT_TR.map((w) => (
            <div
              key={w}
              className="px-2 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide text-center"
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.map((week, wi) =>
            week.map((date, di) => {
              const inMonth = date.getMonth() === month;
              const isToday = isSameDate(date, today);
              const dayItems = itemsForDate(date);
              const visible = dayItems.slice(0, 3);
              const extra = dayItems.length - visible.length;
              const corner =
                wi === lastRow && di === 0
                  ? "rounded-bl-xl"
                  : wi === lastRow && di === 6
                    ? "rounded-br-xl"
                    : "";
              return (
                <div
                  key={`${wi}-${di}`}
                  className={`min-h-[104px] p-1.5 border-b border-r border-slate-100 ${corner} ${
                    inMonth ? "bg-white" : "bg-slate-50/40"
                  }`}
                >
                  <div
                    className={`text-xs mb-1 inline-flex items-center justify-center w-5 h-5 rounded-full ${
                      isToday
                        ? "bg-brand-600 text-white font-semibold"
                        : inMonth
                          ? "text-slate-600"
                          : "text-slate-300"
                    }`}
                  >
                    {date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {visible.map((it) => (
                      <ApptChip key={`${it.source}-${it.id}`} item={it} compact />
                    ))}
                    {extra > 0 && (
                      <Link
                        href={hrefFor("day", date)}
                        className="block text-[10px] text-slate-400 hover:text-brand-600 px-1"
                      >
                        +{extra} tane daha
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}

function WeekView({
  year,
  month,
  day,
  today,
  itemsForDate,
}: {
  year: number;
  month: number;
  day: number;
  today: Date;
  itemsForDate: (d: Date) => ApptItem[];
}) {
  const week = getWeekDates(year, month, day);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
      {week.map((date) => {
        const dayItems = itemsForDate(date);
        const isToday = isSameDate(date, today);
        return (
          <Card key={date.toISOString()} className={`p-3 ${isToday ? "ring-2 ring-brand-500" : ""}`}>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span
                className={`text-sm font-semibold ${isToday ? "text-brand-600" : "text-slate-700"}`}
              >
                {date.getDate()}
              </span>
              <span className="text-[11px] text-slate-400">
                {WEEKDAYS_SHORT_TR[(date.getDay() + 6) % 7]}
              </span>
            </div>
            {dayItems.length === 0 ? (
              <div className="text-[11px] text-slate-300">—</div>
            ) : (
              <div className="space-y-1">
                {dayItems.map((it) => (
                  <ApptChip key={`${it.source}-${it.id}`} item={it} />
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function DayView({
  date,
  today,
  itemsForDate,
}: {
  date: Date;
  today: Date;
  itemsForDate: (d: Date) => ApptItem[];
}) {
  const dayItems = itemsForDate(date);
  const isToday = isSameDate(date, today);
  return (
    <Card className={`p-4 ${isToday ? "ring-2 ring-brand-500" : ""}`}>
      {dayItems.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">Bu gün randevu yok.</div>
      ) : (
        <div className="space-y-2">
          {dayItems.map((it) => (
            <div key={`${it.source}-${it.id}`} className="flex items-start gap-3">
              <span className="text-xs font-medium text-brand-600 tabular-nums w-12 shrink-0 pt-1">
                {it.time ?? "—"}
              </span>
              <div className="flex-1 min-w-0">
                <ApptChip item={it} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
