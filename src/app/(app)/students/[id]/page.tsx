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
import { CourseIcon } from "@/lib/course-icons";
import {
  addInstallment,
  deleteInstallment,
  deleteStudent,
  updateInstallmentStatus,
  updateStudent,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [student, groups] = await Promise.all([
    prisma.student.findUnique({
      where: { id },
      include: {
        installments: { orderBy: { index: "asc" } },
        group: true,
        studentCourses: { include: { course: true }, orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.group.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!student) notFound();

  const updateStudentWithId = updateStudent.bind(null, id);
  const deleteStudentWithId = deleteStudent.bind(null, id);
  const addInstallmentWithId = addInstallment.bind(null, id);

  const paid = student.installments
    .filter((i) => i.status === "Odendi")
    .reduce((a, i) => a + i.amount, 0);
  const rest = student.installments
    .filter((i) => i.status !== "Odendi")
    .reduce((a, i) => a + i.amount, 0);

  return (
    <div>
      <Link href="/students" className="text-xs text-brand-600 hover:underline">
        ← Öğrenciler
      </Link>
      <PageHeader
        title={student.name}
        description={student.group?.name ?? "Grup yok"}
        action={<Badge value={student.status} />}
      />

      {student.studentCourses.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 -mt-4 mb-6">
          <span className="text-xs text-slate-400 mr-1">Kurslar:</span>
          {student.studentCourses.map((sc) => (
            <span
              key={sc.id}
              title={sc.status === "Aktif" ? "Aktif" : "Tamamlandı"}
              className={`inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full text-[11px] font-medium text-white ${
                sc.status === "Aktif" ? "ring-2 ring-offset-1 ring-emerald-500" : "opacity-80"
              }`}
              style={{ backgroundColor: sc.course.color }}
            >
              <CourseIcon name={sc.course.icon} size={11} />
              {sc.course.name}
            </span>
          ))}
          <Link href="/students" className="text-[11px] text-brand-600 hover:underline ml-1">
            düzenle →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1">
          <h2 className="font-semibold text-slate-800 mb-4">Öğrenci Bilgileri</h2>
          <form action={updateStudentWithId} className="space-y-3">
            <div>
              <label className={labelClass}>Ad Soyad *</label>
              <input name="name" required defaultValue={student.name} className={inputClass} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className={labelClass}>Durum</label>
                <select name="status" className={inputClass} defaultValue={student.status}>
                  <option value="Aktif">Aktif</option>
                  <option value="Bekleyen">Bekleyen</option>
                  <option value="Pasif">Pasif</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Sınıf</label>
                <input name="grade" defaultValue={student.grade ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Yaş</label>
                <input
                  name="age"
                  type="number"
                  defaultValue={student.age ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Grup</label>
                <select name="groupId" className={inputClass} defaultValue={student.groupId ?? ""}>
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
                <input
                  name="startDate"
                  defaultValue={student.startDate ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Doğum Günü</label>
                <input
                  name="birthday"
                  defaultValue={student.birthday ?? ""}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Veli Adı Soyadı</label>
                <input
                  name="parentName"
                  defaultValue={student.parentName ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Veli Telefon Numarası</label>
                <input
                  name="parentPhone"
                  defaultValue={student.parentPhone ?? ""}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Not</label>
              <textarea
                name="note"
                rows={3}
                defaultValue={student.note ?? ""}
                className={inputClass}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="primary" className="flex-1">
                Kaydet
              </Button>
            </div>
          </form>
          <form action={deleteStudentWithId} className="mt-3">
            <Button variant="danger" className="w-full">
              Öğrenciyi Sil
            </Button>
          </form>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-800">Ödeme Takvimi</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ödenen:{" "}
                <span className="text-emerald-600 font-medium">
                  {paid.toLocaleString("tr-TR")}₺
                </span>{" "}
                · Kalan:{" "}
                <span className="text-amber-600 font-medium">
                  {rest.toLocaleString("tr-TR")}₺
                </span>
              </p>
            </div>
            <details className="relative">
              <summary className="list-none">
                <SummaryButton variant="secondary">+ Taksit Ekle</SummaryButton>
              </summary>
              <Card className="absolute right-0 mt-2 w-72 p-4 z-10">
                <form action={addInstallmentWithId} className="space-y-3">
                  <div>
                    <label className={labelClass}>Tutar (₺)</label>
                    <input name="amount" type="number" step="0.01" required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Durum</label>
                    <select name="status" className={inputClass} defaultValue="Bekliyor">
                      <option value="Odendi">Ödendi</option>
                      <option value="Bekliyor">Bekliyor</option>
                      <option value="Odenmedi">Ödenmedi</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Not</label>
                    <input name="note" className={inputClass} />
                  </div>
                  <Button variant="primary" className="w-full">
                    Ekle
                  </Button>
                </form>
              </Card>
            </details>
          </div>

          {student.installments.length === 0 ? (
            <EmptyState text="Henüz taksit girilmemiş." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Tutar</Th>
                  <Th>Durum</Th>
                  <Th>Not</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {student.installments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50">
                    <Td>{inst.index}. Kur</Td>
                    <Td className="font-medium">{inst.amount.toLocaleString("tr-TR")}₺</Td>
                    <Td>
                      <form
                        action={async (fd: FormData) => {
                          "use server";
                          await updateInstallmentStatus(
                            inst.id,
                            id,
                            fd.get("status") as string
                          );
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <select
                          name="status"
                          defaultValue={inst.status}
                          className="text-xs rounded-md border border-slate-300 px-2 py-1"
                        >
                          <option value="Odendi">Ödendi</option>
                          <option value="Bekliyor">Bekliyor</option>
                          <option value="Odenmedi">Ödenmedi</option>
                        </select>
                        <button className="text-xs text-brand-600 hover:underline">
                          Kaydet
                        </button>
                      </form>
                    </Td>
                    <Td className="text-slate-500">{inst.note ?? "—"}</Td>
                    <Td>
                      <form
                        action={async () => {
                          "use server";
                          await deleteInstallment(inst.id, id);
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
