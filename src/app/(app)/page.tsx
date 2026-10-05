import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { ChartCard, CourseProgressBars, StackedBarSummary } from "@/components/charts";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [activeStudents, pendingStudents, pasifStudents, paidAgg, pendingAgg, unpaidAgg, courses, teachers] =
    await Promise.all([
      prisma.student.count({ where: { status: "Aktif" } }),
      prisma.student.count({ where: { status: "Bekleyen" } }),
      prisma.student.count({ where: { status: "Pasif" } }),
      prisma.installment.aggregate({
        where: { status: "Odendi" },
        _sum: { amount: true },
      }),
      prisma.installment.aggregate({
        where: { status: "Bekliyor" },
        _sum: { amount: true },
      }),
      prisma.installment.aggregate({
        where: { status: "Odenmedi" },
        _sum: { amount: true },
      }),
      prisma.course.findMany({
        include: { enrollments: { select: { status: true } } },
      }),
      prisma.teacher.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { lessons: true } } },
      }),
    ]);

  const teacherRows = teachers.map((t) => ({ ...t, lessonCount: t._count.lessons }));
  const maxLessonCount = Math.max(...teacherRows.map((t) => t.lessonCount), 1);

  const courseRows = courses.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    active: c.enrollments.filter((e) => e.status === "Aktif").length,
    completed: c.enrollments.filter((e) => e.status === "Tamamlandi").length,
  }));

  return (
    <div>
      <PageHeader title="Panel" description="ZihinGO süreçlerinin genel görünümü" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Ödeme Durumu" description="Tüm taksitlerin tahsilat durumu">
          <StackedBarSummary
            formatValue={(v) => v.toLocaleString("tr-TR") + "₺"}
            segments={[
              { label: "Ödendi", value: paidAgg._sum.amount ?? 0, colorClass: "bg-emerald-500" },
              { label: "Bekliyor", value: pendingAgg._sum.amount ?? 0, colorClass: "bg-amber-400" },
              { label: "Ödenmedi", value: unpaidAgg._sum.amount ?? 0, colorClass: "bg-rose-500" },
            ]}
          />
        </ChartCard>

        <ChartCard title="Öğrenci Durumu" description="Kayıtlı öğrencilerin güncel durumu">
          <StackedBarSummary
            segments={[
              { label: "Aktif", value: activeStudents, colorClass: "bg-emerald-500" },
              { label: "Bekleyen", value: pendingStudents, colorClass: "bg-amber-400" },
              { label: "Pasif", value: pasifStudents, colorClass: "bg-slate-400" },
            ]}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard
            title="Kurs İlerlemesi"
            description="Kurs başına aktif olarak alan ve tamamlayan öğrenci sayısı"
          >
            <CourseProgressBars rows={courseRows} />
          </ChartCard>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">Öğretmenler</h2>
            <Link href="/teachers" className="text-xs text-brand-600 hover:underline">
              Tümünü gör →
            </Link>
          </div>
          {teachers.length === 0 ? (
            <EmptyState text="Henüz öğretmen eklenmedi." />
          ) : (
            <div className="space-y-1">
              {teacherRows.map((t) => (
                <Link
                  key={t.id}
                  href={`/teachers/${t.id}`}
                  className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-800 truncate">{t.name}</div>
                  </div>
                  <div
                    className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden shrink-0"
                    title="Toplam işlenen ders sayısı (göreli)"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-300 to-brand-600"
                      style={{ width: `${(t.lessonCount / maxLessonCount) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs font-semibold text-slate-500 w-6 text-right shrink-0">
                    {t.lessonCount}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
