import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  SummaryButton,
  Table,
  Td,
  Th,
  inputClass,
  labelClass,
} from "@/components/ui";
import {
  addLesson,
  deleteLesson,
  deleteTeacher,
  toggleLessonPaid,
  updateTeacher,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: { lessons: { orderBy: { date: "desc" } } },
  });

  if (!teacher) notFound();

  const updateTeacherWithId = updateTeacher.bind(null, id);
  const deleteTeacherWithId = deleteTeacher.bind(null, id);
  const addLessonWithId = addLesson.bind(null, id);

  const unpaid = teacher.lessons.filter((l) => !l.paid).reduce((a, l) => a + l.fee, 0);
  const paid = teacher.lessons.filter((l) => l.paid).reduce((a, l) => a + l.fee, 0);

  return (
    <div>
      <Link href="/teachers" className="text-xs text-brand-600 hover:underline">
        ← Öğretmenler
      </Link>
      <PageHeader
        title={teacher.name}
        description={`${teacher.rate.toLocaleString("tr-TR")}₺ · ${
          teacher.rateType === "PerHour" ? "saat başına" : "ders başına"
        }`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1">
          <h2 className="font-semibold text-slate-800 mb-4">Öğretmen Bilgileri</h2>
          <form action={updateTeacherWithId} className="space-y-3">
            <div>
              <label className={labelClass}>Ad Soyad *</label>
              <input name="name" required defaultValue={teacher.name} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telefon</label>
              <input name="phone" defaultValue={teacher.phone ?? ""} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Ücret Tipi</label>
                <select name="rateType" className={inputClass} defaultValue={teacher.rateType}>
                  <option value="PerLesson">Ders Başına</option>
                  <option value="PerHour">Saat Başına</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Ücret (₺)</label>
                <input
                  name="rate"
                  type="number"
                  step="0.01"
                  defaultValue={teacher.rate}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Not</label>
              <input name="note" defaultValue={teacher.note ?? ""} className={inputClass} />
            </div>
            <Button variant="primary" className="w-full">
              Kaydet
            </Button>
          </form>
          <form action={deleteTeacherWithId} className="mt-3">
            <Button variant="danger" className="w-full">
              Öğretmeni Sil
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Ödenecek</span>
              <span className="font-semibold text-rose-600">
                {unpaid.toLocaleString("tr-TR")}₺
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Ödenen</span>
              <span className="font-semibold text-emerald-600">
                {paid.toLocaleString("tr-TR")}₺
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Ders Kayıtları</h2>
            <details className="relative">
              <summary className="list-none">
                <SummaryButton variant="secondary">+ Ders Ekle</SummaryButton>
              </summary>
              <Card className="absolute right-0 mt-2 w-80 p-4 z-10">
                <form action={addLessonWithId} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Tarih</label>
                      <input name="date" type="date" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Saat</label>
                      <input name="time" placeholder="18:30" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Gün</label>
                    <input name="day" placeholder="Cumartesi" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Öğrenci / Grup</label>
                    <input name="groupLabel" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Kurs</label>
                    <input name="course" className={inputClass} />
                  </div>
                  {teacher.rateType === "PerHour" && (
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
                  )}
                  <div>
                    <label className={labelClass}>Not</label>
                    <input name="note" className={inputClass} />
                  </div>
                  <p className="text-xs text-slate-400">
                    Ücret otomatik hesaplanır:{" "}
                    {teacher.rateType === "PerHour"
                      ? `${teacher.rate.toLocaleString("tr-TR")}₺ x saat`
                      : `${teacher.rate.toLocaleString("tr-TR")}₺ / ders`}
                  </p>
                  <Button variant="primary" className="w-full">
                    Ekle
                  </Button>
                </form>
              </Card>
            </details>
          </div>

          {teacher.lessons.length === 0 ? (
            <EmptyState text="Henüz ders girilmemiş." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Tarih</Th>
                  <Th>Öğrenci / Grup</Th>
                  <Th>Kurs</Th>
                  <Th>Ücret</Th>
                  <Th>Durum</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {teacher.lessons.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <Td>
                      {l.date}
                      {l.time && <span className="text-slate-400"> · {l.time}</span>}
                    </Td>
                    <Td>{l.groupLabel ?? "—"}</Td>
                    <Td>{l.course ?? "—"}</Td>
                    <Td className="font-medium">{l.fee.toLocaleString("tr-TR")}₺</Td>
                    <Td>
                      <form
                        action={async () => {
                          "use server";
                          await toggleLessonPaid(l.id, id, !l.paid);
                        }}
                      >
                        <button type="submit">
                          <Badge value={l.paid ? "Odendi" : "Bekliyor"} />
                        </button>
                      </form>
                    </Td>
                    <Td>
                      <form
                        action={async () => {
                          "use server";
                          await deleteLesson(l.id, id);
                        }}
                      >
                        <button className="text-xs text-rose-500 hover:underline">Sil</button>
                      </form>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
