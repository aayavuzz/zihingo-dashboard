import { ChevronDown } from "lucide-react";
import { prisma } from "@/lib/db";
import {
  Button,
  Card,
  EmptyState,
  PageHeader,
  SummaryButton,
  inputClass,
  labelClass,
} from "@/components/ui";
import { CourseIcon, IconPicker } from "@/lib/course-icons";
import { createCourse, deleteCourse, updateCourse } from "./actions";

export const dynamic = "force-dynamic";

const rowCols = "grid grid-cols-[40px_1fr_120px_28px] items-center gap-3";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { enrollments: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Kurlar"
        description="Okulunuzda verilen tüm kurları burada tanımlayın — her kur bir renk ve ikonla temsil edilir"
        action={
          <details className="relative">
            <summary className="list-none">
              <SummaryButton variant="primary">+ Kur Ekle</SummaryButton>
            </summary>
            <Card className="absolute right-0 mt-2 w-[26rem] p-4 z-10">
              <form action={createCourse} className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className={labelClass}>Kur Adı *</label>
                    <input name="name" required className={inputClass} />
                  </div>
                  <div className="w-24 shrink-0">
                    <label className={labelClass}>Renk</label>
                    <input
                      name="color"
                      type="color"
                      defaultValue="#502e9f"
                      className="w-full h-9 rounded-lg border border-slate-300 cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>İkon</label>
                  <IconPicker name="icon" defaultValue="BookOpen" />
                </div>
                <Button variant="primary" className="w-full">
                  Kaydet
                </Button>
              </form>
            </Card>
          </details>
        }
      />

      <Card>
        {courses.length === 0 ? (
          <EmptyState text="Henüz kur eklenmedi." />
        ) : (
          <div>
            <div
              className={`${rowCols} px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wide`}
            >
              <span />
              <span>Kur Adı</span>
              <span>Öğrenci Sayısı</span>
              <span />
            </div>
            {courses.map((c) => {
              const updateCourseWithId = updateCourse.bind(null, c.id);
              const deleteCourseWithId = deleteCourse.bind(null, c.id);
              return (
                <details key={c.id} className="group border-b border-slate-100 last:border-b-0">
                  <summary
                    className={`${rowCols} list-none cursor-pointer px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors`}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: c.color }}
                    >
                      <CourseIcon name={c.icon} size={14} />
                    </span>
                    <span className="font-medium text-slate-800">{c.name}</span>
                    <span className="text-slate-500">{c._count.enrollments} öğrenci</span>
                    <ChevronDown
                      size={16}
                      className="text-slate-400 transition-transform group-open:rotate-180 justify-self-end"
                    />
                  </summary>
                  <div className="px-4 pb-5 pt-3 bg-slate-50/60 border-t border-slate-100">
                    <form action={updateCourseWithId} className="space-y-3">
                      <div className="flex gap-3 max-w-xl">
                        <div className="flex-1">
                          <label className={labelClass}>Kur Adı *</label>
                          <input
                            name="name"
                            required
                            defaultValue={c.name}
                            className={inputClass}
                          />
                        </div>
                        <div className="w-28 shrink-0">
                          <label className={labelClass}>Renk</label>
                          <input
                            name="color"
                            type="color"
                            defaultValue={c.color}
                            className="w-full h-9 rounded-lg border border-slate-300 cursor-pointer"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>İkon</label>
                        <IconPicker name="icon" defaultValue={c.icon} />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button variant="primary">Kaydet</Button>
                      </div>
                    </form>
                    <form action={deleteCourseWithId} className="mt-3">
                      <Button variant="danger">Kuru Sil</Button>
                    </form>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
