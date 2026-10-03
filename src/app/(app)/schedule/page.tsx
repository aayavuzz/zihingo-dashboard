import Link from "next/link";
import { CheckCircle2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button, Card, inputClass, labelClass } from "@/components/ui";
import { CourseIcon } from "@/lib/course-icons";
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
  createSession,
  deleteSession,
  logLessonForSession,
  updateSession,
} from "./actions";

export const dynamic = "force-dynamic";

type View = "day" | "week" | "month" | "year";

function hrefFor(view: View, date: Date) {
  const p = new URLSearchParams();
  p.set("view", view);
  p.set("y", String(date.getFullYear()));
  p.set("m", String(date.getMonth() + 1));
  p.set("d", String(date.getDate()));
  return `/schedule?${p.toString()}`;
}

function shiftDate(date: Date, view: View, dir: number) {
  const d = new Date(date);
  if (view === "month") d.setMonth(d.getMonth() + dir);
  else if (view === "week") d.setDate(d.getDate() + 7 * dir);
  else if (view === "day") d.setDate(d.getDate() + dir);
  else if (view === "year") d.setFullYear(d.getFullYear() + dir);
  return d;
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; y?: string; m?: string; d?: string }>;
}) {
  const sp = await searchParams;
  const today = new Date();
  const view: View =
    sp.view === "day" || sp.view === "week" || sp.view === "year" ? sp.view : "month";
  const y = Number(sp.y) || today.getFullYear();
  const m = (Number(sp.m) || today.getMonth() + 1) - 1;
  const d = Number(sp.d) || today.getDate();
  const refDate = new Date(y, m, d);

  const [sessions, teachers, groups, allStudents, courses] = await Promise.all([
    prisma.scheduleSession.findMany({
      include: { teacher: true, group: true, course: true, lessons: true },
      orderBy: { time: "asc" },
    }),
    prisma.teacher.findMany({ orderBy: { name: "asc" } }),
    prisma.group.findMany({ orderBy: { name: "asc" } }),
    prisma.student.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, groupId: true },
    }),
    prisma.course.findMany({ orderBy: { name: "asc" } }),
  ]);

  const studentsByGroupId = new Map<string, string[]>();
  for (const r of allStudents) {
    if (!r.groupId) continue;
    const arr = studentsByGroupId.get(r.groupId) ?? [];
    arr.push(r.name);
    studentsByGroupId.set(r.groupId, arr);
  }

  function sessionsForDate(date: Date) {
    const dayName = weekdayNameFromDate(date);
    const iso = formatISODate(date);
    return sessions
      .filter((s) => (s.recurring ? s.day === dayName : s.date === iso))
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  const prevHref = hrefFor(view, shiftDate(refDate, view, -1));
  const nextHref = hrefFor(view, shiftDate(refDate, view, 1));
  const todayHref = hrefFor(view, today);

  let title = "";
  if (view === "month") title = `${MONTHS_TR[m]} ${y}`;
  else if (view === "year") title = String(y);
  else if (view === "day")
    title = `${d} ${MONTHS_TR[m]} ${y} · ${weekdayNameFromDate(refDate)}`;
  else {
    const week = getWeekDates(y, m, d);
    const start = week[0];
    const end = week[6];
    title =
      start.getMonth() === end.getMonth()
        ? `${start.getDate()} - ${end.getDate()} ${MONTHS_TR[start.getMonth()]} ${start.getFullYear()}`
        : `${start.getDate()} ${MONTHS_TR[start.getMonth()]} - ${end.getDate()} ${MONTHS_TR[end.getMonth()]} ${end.getFullYear()}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <details className="relative">
          <summary className="list-none">
            <span className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center cursor-pointer hover:bg-brand-700 transition-colors">
              <Plus size={18} />
            </span>
          </summary>
          <Card className="absolute left-0 mt-2 w-96 p-4 z-20">
            <AddSessionForm
              groups={groups}
              students={allStudents}
              teachers={teachers}
              courses={courses}
              defaultDate={formatISODate(refDate)}
            />
          </Card>
        </details>

        <div className="flex items-center gap-1 bg-white ring-1 ring-slate-200 rounded-lg p-1">
          {(["day", "week", "month", "year"] as View[]).map((v) => (
            <Link
              key={v}
              href={hrefFor(v, refDate)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === v
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {v === "day" ? "Gün" : v === "week" ? "Hafta" : v === "month" ? "Ay" : "Yıl"}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-[1.35rem] font-bold text-slate-900 tracking-tight">{title}</h1>
        <div className="flex items-center gap-1.5">
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
        <MonthView
          year={y}
          month={m}
          today={today}
          sessionsForDate={sessionsForDate}
          studentsByGroupId={studentsByGroupId}
          groups={groups}
          students={allStudents}
          courses={courses}
          teachers={teachers}
        />
      )}
      {view === "week" && (
        <WeekView
          year={y}
          month={m}
          day={d}
          today={today}
          sessionsForDate={sessionsForDate}
          studentsByGroupId={studentsByGroupId}
          groups={groups}
          students={allStudents}
          courses={courses}
          teachers={teachers}
        />
      )}
      {view === "day" && (
        <DayView
          date={refDate}
          today={today}
          sessionsForDate={sessionsForDate}
          studentsByGroupId={studentsByGroupId}
          groups={groups}
          students={allStudents}
          courses={courses}
          teachers={teachers}
        />
      )}
      {view === "year" && (
        <YearView year={y} today={today} sessionsForDate={sessionsForDate} />
      )}
    </div>
  );
}

type Teacher = { id: string; name: string; rate: number; rateType: string };
type Group = { id: string; name: string };
type StudentOpt = { id: string; name: string };
type CourseOpt = { id: string; name: string; color: string; icon: string };
type SessionWithRel = {
  id: string;
  date: string;
  day: string;
  time: string;
  recurring: boolean;
  title: string;
  note: string | null;
  groupId: string | null;
  group: Group | null;
  courseId: string | null;
  course: CourseOpt | null;
  teacherId: string | null;
  teacher: Teacher | null;
  durationHrs: number;
  lessons: { id: string; date: string; fee: number; paid: boolean }[];
};
type SessionsForDate = (date: Date) => SessionWithRel[];

function StudentSelect({
  students,
  defaultValue = "",
}: {
  students: StudentOpt[];
  defaultValue?: string;
}) {
  return (
    <select name="studentId" className={inputClass} defaultValue={defaultValue}>
      <option value="">— Öğrenci seçme —</option>
      {students.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}

function CourseSelect({
  courses,
  defaultValue = "",
}: {
  courses: CourseOpt[];
  defaultValue?: string;
}) {
  return (
    <select name="courseId" className={inputClass} defaultValue={defaultValue}>
      <option value="">— Kurs seçilmedi —</option>
      {courses.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

function AddSessionForm({
  groups,
  students,
  courses,
  teachers,
  defaultDate,
}: {
  groups: Group[];
  students: StudentOpt[];
  courses: CourseOpt[];
  teachers: Teacher[];
  defaultDate?: string;
}) {
  return (
    <form action={createSession} className="space-y-3">
      <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
        Ders Ekle
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tarih *</label>
          <input
            name="date"
            type="date"
            required
            defaultValue={defaultDate}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Saat *</label>
          <input name="time" placeholder="14:00" required className={inputClass} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer -mt-1">
        <input
          type="checkbox"
          name="recurring"
          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        Her hafta bu günde tekrarla (haftalık ders)
      </label>
      <div>
        <label className={labelClass}>Ders Türü: Grup</label>
        <select name="groupId" className={inputClass} defaultValue="">
          <option value="">— Grup dersi değil —</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Ders Türü: Öğrenci (Bireysel Ders)</label>
        <StudentSelect students={students} />
        <p className="text-[11px] text-slate-400 mt-1">
          Grup ya da öğrenci seçmezseniz aşağıdaki başlığı kullanın.
        </p>
      </div>
      <div>
        <label className={labelClass}>Başlık</label>
        <input name="title" placeholder="Örn: Deneme Dersi" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Kurs</label>
        <CourseSelect courses={courses} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Öğretmen</label>
          <select name="teacherId" className={inputClass} defaultValue="">
            <option value="">Atanmadı</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Süre (saat)</label>
          <input
            name="durationHrs"
            type="number"
            step="0.5"
            defaultValue={1}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Not</label>
        <input name="note" className={inputClass} />
      </div>
      <Button variant="primary" className="w-full">
        Ekle
      </Button>
    </form>
  );
}

function SessionEditForm({
  session,
  groups,
  students,
  courses,
  teachers,
}: {
  session: SessionWithRel;
  groups: Group[];
  students: StudentOpt[];
  courses: CourseOpt[];
  teachers: Teacher[];
}) {
  const updateWithId = updateSession.bind(null, session.id);
  const deleteWithId = deleteSession.bind(null, session.id);
  return (
    <div className="space-y-3">
      <form action={updateWithId} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Tarih</label>
            <input
              name="date"
              type="date"
              defaultValue={session.date}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Saat</label>
            <input name="time" defaultValue={session.time} className={inputClass} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer -mt-1">
          <input
            type="checkbox"
            name="recurring"
            defaultChecked={session.recurring}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Her hafta bu günde tekrarla (haftalık ders)
        </label>
        <div>
          <label className={labelClass}>Ders Türü: Grup</label>
          <select name="groupId" className={inputClass} defaultValue={session.groupId ?? ""}>
            <option value="">— Grup dersi değil —</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Ders Türü: Öğrenci (Bireysel Ders)</label>
          <StudentSelect
            students={students}
            defaultValue={students.find((s) => s.name === session.title)?.id ?? ""}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Öğrenci seçmezseniz aşağıdaki mevcut başlık korunur.
          </p>
        </div>
        <div>
          <label className={labelClass}>Mevcut Başlık</label>
          <input name="title" defaultValue={session.title} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Kurs</label>
          <CourseSelect courses={courses} defaultValue={session.courseId ?? ""} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Öğretmen</label>
            <select
              name="teacherId"
              className={inputClass}
              defaultValue={session.teacherId ?? ""}
            >
              <option value="">Atanmadı</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Süre (saat)</label>
            <input
              name="durationHrs"
              type="number"
              step="0.5"
              defaultValue={session.durationHrs}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Not</label>
          <input name="note" defaultValue={session.note ?? ""} className={inputClass} />
        </div>
        <Button variant="primary" className="w-full">
          Kaydet
        </Button>
      </form>
      <form action={deleteWithId}>
        <Button variant="danger" className="w-full">
          Bu haftalık dersi sil
        </Button>
      </form>
    </div>
  );
}

function SessionPopoverBody({
  session,
  dateISO,
  groups,
  students,
  courses,
  teachers,
  studentsByGroupId,
}: {
  session: SessionWithRel;
  dateISO: string;
  groups: Group[];
  students: StudentOpt[];
  courses: CourseOpt[];
  teachers: Teacher[];
  studentsByGroupId: Map<string, string[]>;
}) {
  const logWithId = logLessonForSession.bind(null, session.id, dateISO);
  const totalFee = session.lessons.reduce((a, l) => a + l.fee, 0);
  const unpaidFee = session.lessons.filter((l) => !l.paid).reduce((a, l) => a + l.fee, 0);
  const members = session.groupId ? studentsByGroupId.get(session.groupId) ?? [] : [];
  const alreadyLogged = session.lessons.some((l) => l.date === dateISO);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-slate-800">{session.title}</div>
        <div className="text-xs text-slate-500 mt-0.5">
          {session.group ? "Grup dersi" : "Bireysel ders"} ·{" "}
          {session.recurring ? `Her ${session.day}` : session.date} · {session.time} ·{" "}
          {session.durationHrs} saat
        </div>
        {session.course && (
          <span
            className="inline-flex items-center gap-1 mt-1.5 pl-1.5 pr-2 py-0.5 rounded-full text-[11px] font-medium text-white"
            style={{ backgroundColor: session.course.color }}
          >
            <CourseIcon name={session.course.icon} size={11} />
            {session.course.name}
          </span>
        )}
      </div>

      {session.group && (
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Grup Üyeleri ({members.length})
          </div>
          <div className="text-xs text-slate-600 leading-relaxed">
            {members.length > 0 ? members.join(", ") : "Bu grupta henüz öğrenci yok."}
          </div>
        </div>
      )}

      <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-3">
        {session.teacher ? (
          <>
            <div className="text-xs text-slate-600">
              Öğretmen: <span className="font-medium text-slate-800">{session.teacher.name}</span>{" "}
              · {session.teacher.rate.toLocaleString("tr-TR")}₺{" "}
              {session.teacher.rateType === "PerHour" ? "/ saat" : "/ ders"}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              İşlenen ders: <span className="font-medium">{session.lessons.length}</span> · Toplam
              hakediş: <span className="font-medium">{totalFee.toLocaleString("tr-TR")}₺</span>
              {unpaidFee > 0 && (
                <span className="text-amber-600">
                  {" "}
                  (Bekleyen: {unpaidFee.toLocaleString("tr-TR")}₺)
                </span>
              )}
            </div>
            <Link
              href={`/teachers/${session.teacherId}`}
              className="text-[11px] text-brand-600 hover:underline"
            >
              Öğretmen sayfasında gör →
            </Link>
            {alreadyLogged ? (
              <div className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-xs font-medium text-emerald-700">
                <CheckCircle2 size={14} />
                {dateISO} için ders işlendi
              </div>
            ) : (
              <form action={logWithId} className="mt-2">
                <Button variant="secondary" className="w-full">
                  {dateISO} için ders işle (+1)
                </Button>
              </form>
            )}
          </>
        ) : (
          <div className="text-xs text-slate-500">
            Bu derse henüz öğretmen atanmadı. Düzenleyerek öğretmen atayabilirsiniz.
          </div>
        )}
      </div>

      <details>
        <summary className="text-xs font-medium text-slate-500 cursor-pointer hover:text-brand-600">
          Düzenle / Sil
        </summary>
        <div className="mt-3">
          <SessionEditForm
            session={session}
            groups={groups}
            students={students}
            courses={courses}
            teachers={teachers}
          />
        </div>
      </details>
    </div>
  );
}

function SessionChip({
  session,
  date,
  groups,
  students,
  courses,
  teachers,
  studentsByGroupId,
  compact = false,
}: {
  session: SessionWithRel;
  date: Date;
  groups: Group[];
  students: StudentOpt[];
  courses: CourseOpt[];
  teachers: Teacher[];
  studentsByGroupId: Map<string, string[]>;
  compact?: boolean;
}) {
  const dateISO = formatISODate(date);
  const dotStyle = session.course
    ? { backgroundColor: session.course.color }
    : undefined;
  const dotClass = session.course
    ? ""
    : session.teacher
      ? "bg-brand-500"
      : "bg-slate-400";
  return (
    <details className="group/chip relative">
      <summary
        className={`list-none cursor-pointer flex items-center gap-1 rounded px-1 py-0.5 hover:bg-slate-100 ${
          compact ? "text-[11px]" : "text-xs"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} style={dotStyle} />
        <span className="truncate text-slate-700">{session.title}</span>
        {!compact && <span className="text-slate-400 shrink-0">{session.time}</span>}
      </summary>
      <Card className="absolute left-0 top-full mt-1 w-80 p-4 z-30 text-left">
        <SessionPopoverBody
          session={session}
          dateISO={dateISO}
          groups={groups}
          students={students}
          courses={courses}
          teachers={teachers}
          studentsByGroupId={studentsByGroupId}
        />
      </Card>
    </details>
  );
}

function MonthView({
  year,
  month,
  today,
  sessionsForDate,
  studentsByGroupId,
  groups,
  students,
  courses,
  teachers,
}: {
  year: number;
  month: number;
  today: Date;
  sessionsForDate: SessionsForDate;
  studentsByGroupId: Map<string, string[]>;
  groups: Group[];
  students: StudentOpt[];
  courses: CourseOpt[];
  teachers: Teacher[];
}) {
  const weeks = getMonthGridWeeks(year, month);
  const lastRow = weeks.length - 1;
  return (
    <Card>
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
            const daySessions = sessionsForDate(date);
            const visible = daySessions.slice(0, 3);
            const extra = daySessions.length - visible.length;
            const cornerClass =
              wi === lastRow && di === 0
                ? "rounded-bl-xl"
                : wi === lastRow && di === 6
                  ? "rounded-br-xl"
                  : "";
            return (
              <div
                key={`${wi}-${di}`}
                className={`min-h-[104px] p-1.5 border-b border-r border-slate-100 ${cornerClass} ${
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
                  {visible.map((s) => (
                    <SessionChip
                      key={s.id}
                      session={s}
                      date={date}
                      groups={groups}
                      students={students}
                      courses={courses}
                      teachers={teachers}
                      studentsByGroupId={studentsByGroupId}
                      compact
                    />
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
    </Card>
  );
}

function WeekView({
  year,
  month,
  day,
  today,
  sessionsForDate,
  studentsByGroupId,
  groups,
  students,
  courses,
  teachers,
}: {
  year: number;
  month: number;
  day: number;
  today: Date;
  sessionsForDate: SessionsForDate;
  studentsByGroupId: Map<string, string[]>;
  groups: Group[];
  students: StudentOpt[];
  courses: CourseOpt[];
  teachers: Teacher[];
}) {
  const dates = getWeekDates(year, month, day);
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
      {dates.map((date) => {
        const isToday = isSameDate(date, today);
        const daySessions = sessionsForDate(date);
        return (
          <Card key={date.toISOString()} className={`p-3 ${isToday ? "ring-2 ring-brand-500" : ""}`}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {weekdayNameFromDate(date)}
            </div>
            <div
              className={`text-sm mb-2 ${isToday ? "text-brand-600 font-bold" : "text-slate-400"}`}
            >
              {date.getDate()} {MONTHS_TR[date.getMonth()]}
            </div>
            {daySessions.length === 0 ? (
              <div className="text-xs text-slate-300">—</div>
            ) : (
              <div className="space-y-1">
                {daySessions.map((s) => (
                  <SessionChip
                    key={s.id}
                    session={s}
                    date={date}
                    groups={groups}
                    students={students}
                    courses={courses}
                    teachers={teachers}
                    studentsByGroupId={studentsByGroupId}
                  />
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
  sessionsForDate,
  studentsByGroupId,
  groups,
  students,
  courses,
  teachers,
}: {
  date: Date;
  today: Date;
  sessionsForDate: SessionsForDate;
  studentsByGroupId: Map<string, string[]>;
  groups: Group[];
  students: StudentOpt[];
  courses: CourseOpt[];
  teachers: Teacher[];
}) {
  const daySessions = sessionsForDate(date);
  const isToday = isSameDate(date, today);
  return (
    <Card className={`p-5 max-w-xl ${isToday ? "ring-2 ring-brand-500" : ""}`}>
      {daySessions.length === 0 ? (
        <div className="text-sm text-slate-400">Bu gün için ders yok.</div>
      ) : (
        <div className="space-y-2">
          {daySessions.map((s) => (
            <div key={s.id} className="rounded-lg ring-1 ring-slate-200 px-3 py-2">
              <SessionChip
                session={s}
                date={date}
                groups={groups}
                students={students}
                courses={courses}
                teachers={teachers}
                studentsByGroupId={studentsByGroupId}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function YearView({
  year,
  today,
  sessionsForDate,
}: {
  year: number;
  today: Date;
  sessionsForDate: SessionsForDate;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {MONTHS_TR.map((name, mi) => {
        const weeks = getMonthGridWeeks(year, mi);
        return (
          <Card key={name} className="p-3">
            <Link
              href={hrefFor("month", new Date(year, mi, 1))}
              className="text-sm font-semibold text-slate-800 hover:text-brand-600"
            >
              {name}
            </Link>
            <div className="grid grid-cols-7 gap-y-0.5 mt-2">
              {weeks.flat().map((date, i) => {
                const inMonth = date.getMonth() === mi;
                const isToday = isSameDate(date, today);
                const busy = inMonth && sessionsForDate(date).length > 0;
                return (
                  <Link
                    key={i}
                    href={hrefFor("day", date)}
                    className={`text-[10px] h-5 flex items-center justify-center rounded-full relative ${
                      isToday
                        ? "bg-brand-600 text-white"
                        : inMonth
                          ? "text-slate-500 hover:bg-slate-100"
                          : "text-slate-200"
                    }`}
                  >
                    {date.getDate()}
                    {busy && !isToday && (
                      <span className="absolute bottom-0 w-1 h-1 rounded-full bg-brand-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
