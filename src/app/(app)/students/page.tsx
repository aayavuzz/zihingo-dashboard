import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import { prisma } from "@/lib/db";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  SummaryButton,
  inputClass,
  labelClass,
} from "@/components/ui";
import { CourseChip, CourseIcon } from "@/lib/course-icons";
import {
  addStudentCourse,
  createStudent,
  deleteStudent,
  removeStudentCourse,
  updateStudent,
  updateStudentCourseStatus,
} from "./actions";

export const dynamic = "force-dynamic";

// Öğrenci | Durum | Yaş/Sınıf | Kurs | Ödeme | ok
const rowCols =
  "grid grid-cols-[minmax(140px,1.4fr)_92px_84px_minmax(160px,1.3fr)_110px_28px] items-center gap-3";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;

  const [students, courses, groups] = await Promise.all([
    prisma.student.findMany({
      where: {
        status: status && status !== "all" ? status : undefined,
        name: q ? { contains: q } : undefined,
      },
      orderBy: { createdAt: "asc" },
      include: {
        installments: true,
        group: true,
        studentCourses: {
          include: { course: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.course.findMany({ orderBy: { name: "asc" } }),
    prisma.group.findMany({ orderBy: { name: "asc" } }),
  ]);

  const filters = [
    { key: "all", label: "Tümü" },
    { key: "Aktif", label: "Aktif" },
    { key: "Bekleyen", label: "Bekleyen" },
    { key: "Pasif", label: "Pasif" },
  ];

  return (
    <div>
      <PageHeader
        title="Öğrenciler"
        description={`${students.length} kayıt listeleniyor — bir öğrenciye tıklayarak dersini görüntüle ve düzenle`}
        action={
          <details className="relative">
            <summary className="list-none">
              <SummaryButton variant="primary">+ Öğrenci Ekle</SummaryButton>
            </summary>
            <Card className="absolute right-0 mt-2 w-96 p-4 z-10">
              <form action={createStudent} className="space-y-3">
                <div>
                  <label className={labelClass}>Ad Soyad *</label>
                  <input name="name" required className={inputClass} />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className={labelClass}>Durum</label>
                    <select name="status" className={inputClass} defaultValue="Aktif">
                      <option value="Aktif">Aktif</option>
                      <option value="Bekleyen">Bekleyen</option>
                      <option value="Pasif">Pasif</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Sınıf</label>
                    <input name="grade" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Yaş</label>
                    <input name="age" type="number" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Grup</label>
                    <select name="groupId" className={inputClass} defaultValue="">
                      <option value="">— Grup yok —</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Başlangıç Tarihi</label>
                    <input name="startDate" placeholder="gg.aa.yyyy" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Doğum Günü</label>
                    <input name="birthday" placeholder="gg/aa/yyyy" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Veli Adı Soyadı</label>
                    <input name="parentName" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Veli Telefon Numarası</label>
                    <input name="parentPhone" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Not</label>
                  <textarea name="note" rows={3} className={inputClass} />
                </div>
                <p className="text-xs text-slate-400">
                  Kurslar öğrenci eklendikten sonra, satırını açarak eklenir.
                </p>
                <Button variant="primary" className="w-full">
                  Kaydet
                </Button>
              </form>
            </Card>
          </details>
        }
      />

      <div className="flex items-center gap-4 mb-4">
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={`/students?status=${f.key}`}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                (status ?? "all") === f.key
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <form className="flex-1">
          <input type="hidden" name="status" value={status ?? "all"} />
          <input
            name="q"
            defaultValue={q}
            placeholder="İsimle ara..."
            className={inputClass + " max-w-xs"}
          />
        </form>
      </div>

      <Card>
        {students.length === 0 ? (
          <EmptyState text="Kayıt bulunamadı." />
        ) : (
          <div>
            <div
              className={`${rowCols} px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wide`}
            >
              <span>Öğrenci</span>
              <span>Durum</span>
              <span>Yaş / Sınıf</span>
              <span>Kurs</span>
              <span>Ödeme</span>
              <span />
            </div>

            {students.map((s) => {
              const paid = s.installments
                .filter((i) => i.status === "Odendi")
                .reduce((a, i) => a + i.amount, 0);
              const pending = s.installments
                .filter((i) => i.status !== "Odendi")
                .reduce((a, i) => a + i.amount, 0);
              const updateStudentWithId = updateStudent.bind(null, s.id);
              const deleteStudentWithId = deleteStudent.bind(null, s.id);
              const addStudentCourseWithId = addStudentCourse.bind(null, s.id);

              return (
                <details key={s.id} className="group border-b border-slate-100 last:border-b-0">
                  <summary
                    className={`${rowCols} list-none cursor-pointer px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors`}
                  >
                    <span className="font-medium text-slate-800 truncate">{s.name}</span>
                    <span>
                      <Badge value={s.status} />
                    </span>
                    <span className="text-slate-500">
                      {s.age ?? "—"} / {s.grade ?? "—"}
                    </span>
                    <span className="flex items-center gap-1 flex-wrap">
                      {s.studentCourses.length === 0 ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        s.studentCourses.map((sc) => (
                          <CourseChip
                            key={sc.id}
                            name={sc.course.name}
                            color={sc.course.color}
                            icon={sc.course.icon}
                            active={sc.status === "Aktif"}
                            size={24}
                          />
                        ))
                      )}
                    </span>
                    <span>
                      <span className="text-emerald-600 font-medium">
                        {paid.toLocaleString("tr-TR")}₺
                      </span>
                      {pending > 0 && (
                        <span className="text-amber-600 ml-1">
                          (+{pending.toLocaleString("tr-TR")}₺)
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      size={16}
                      className="text-slate-400 transition-transform group-open:rotate-180 justify-self-end"
                    />
                  </summary>

                  <div className="px-4 pb-5 pt-3 bg-slate-50/60 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
                        Dersleri ve bilgileri
                      </div>
                      <Link
                        href={`/students/${s.id}`}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        Ödeme geçmişini gör →
                      </Link>
                    </div>

                    <div className="mb-5">
                      <div className="text-xs font-medium text-slate-600 mb-2">
                        Kurslar{" "}
                        <span className="text-slate-400 font-normal">
                          (son alınan en sonda, aktif olan vurgulu)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {s.studentCourses.length === 0 && (
                          <span className="text-xs text-slate-400">Henüz kurs eklenmedi.</span>
                        )}
                        {s.studentCourses.map((sc) => {
                          const removeWithId = removeStudentCourse.bind(null, sc.id, s.id);
                          const toggleActiveWithId = updateStudentCourseStatus.bind(
                            null,
                            sc.id,
                            s.id,
                            sc.status === "Aktif" ? "Tamamlandi" : "Aktif"
                          );
                          return (
                            <div
                              key={sc.id}
                              className={`flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full text-xs font-medium text-white ${
                                sc.status === "Aktif" ? "ring-2 ring-offset-1 ring-emerald-500" : ""
                              }`}
                              style={{ backgroundColor: sc.course.color }}
                            >
                              <CourseIcon name={sc.course.icon} size={12} />
                              <span>{sc.course.name}</span>
                              <form action={toggleActiveWithId}>
                                <button
                                  type="submit"
                                  className="text-[9px] bg-white/20 hover:bg-white/35 rounded px-1.5 py-0.5"
                                  title={
                                    sc.status === "Aktif"
                                      ? "Tamamlandı olarak işaretle"
                                      : "Aktif olarak işaretle"
                                  }
                                >
                                  {sc.status === "Aktif" ? "Aktif" : "Tamamlandı"}
                                </button>
                              </form>
                              <form action={removeWithId}>
                                <button
                                  type="submit"
                                  className="opacity-70 hover:opacity-100 pl-0.5"
                                  title="Kaldır"
                                >
                                  <X size={12} />
                                </button>
                              </form>
                            </div>
                          );
                        })}
                      </div>
                      <form
                        action={addStudentCourseWithId}
                        className="flex items-end gap-2 flex-wrap"
                      >
                        <div className="min-w-[160px]">
                          <label className={labelClass}>Kurs Ekle</label>
                          <select name="courseId" required className={inputClass} defaultValue="">
                            <option value="" disabled>
                              Seçiniz
                            </option>
                            {courses.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="min-w-[150px]">
                          <label className={labelClass}>Durum</label>
                          <select name="status" defaultValue="Tamamlandi" className={inputClass}>
                            <option value="Tamamlandi">Tamamlandı</option>
                            <option value="Aktif">Aktif (şu an alıyor)</option>
                          </select>
                        </div>
                        <Button variant="secondary">Ekle</Button>
                      </form>
                    </div>

                    <form action={updateStudentWithId} className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div>
                          <label className={labelClass}>Ad Soyad *</label>
                          <input
                            name="name"
                            required
                            defaultValue={s.name}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Durum</label>
                          <select name="status" className={inputClass} defaultValue={s.status}>
                            <option value="Aktif">Aktif</option>
                            <option value="Bekleyen">Bekleyen</option>
                            <option value="Pasif">Pasif</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Sınıf</label>
                          <input name="grade" defaultValue={s.grade ?? ""} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Yaş</label>
                          <input
                            name="age"
                            type="number"
                            defaultValue={s.age ?? ""}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Grup</label>
                          <select
                            name="groupId"
                            className={inputClass}
                            defaultValue={s.groupId ?? ""}
                          >
                            <option value="">— Grup yok —</option>
                            {groups.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Başlangıç Tarihi</label>
                          <input
                            name="startDate"
                            defaultValue={s.startDate ?? ""}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Doğum Günü</label>
                          <input
                            name="birthday"
                            defaultValue={s.birthday ?? ""}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Veli Adı Soyadı</label>
                          <input
                            name="parentName"
                            defaultValue={s.parentName ?? ""}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Veli Telefon Numarası</label>
                          <input
                            name="parentPhone"
                            defaultValue={s.parentPhone ?? ""}
                            className={inputClass}
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-5">
                          <label className={labelClass}>Not</label>
                          <textarea
                            name="note"
                            rows={3}
                            defaultValue={s.note ?? ""}
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button variant="primary">Kaydet</Button>
                      </div>
                    </form>
                    <form action={deleteStudentWithId} className="mt-3">
                      <Button variant="danger">Öğrenciyi Sil</Button>
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
