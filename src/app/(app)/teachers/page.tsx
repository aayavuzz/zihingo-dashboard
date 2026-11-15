import Link from "next/link";
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
import { createTeacher } from "./actions";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const teachers = await prisma.teacher.findMany({
    include: { lessons: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Öğretmenler"
        description="Öğretmenler, verdikleri dersler ve ücret takibi"
        action={
          <details className="relative">
            <summary className="list-none">
              <SummaryButton variant="primary">+ Öğretmen Ekle</SummaryButton>
            </summary>
            <Card className="absolute right-0 mt-2 w-80 p-4 z-10">
              <form action={createTeacher} className="space-y-3">
                <div>
                  <label className={labelClass}>Ad Soyad *</label>
                  <input name="name" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Telefon</label>
                  <input name="phone" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Ücret Tipi</label>
                    <select name="rateType" className={inputClass} defaultValue="PerLesson">
                      <option value="PerLesson">Ders Başına</option>
                      <option value="PerHour">Saat Başına</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Ücret (₺)</label>
                    <input name="rate" type="number" step="0.01" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Not</label>
                  <input name="note" className={inputClass} />
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
        {teachers.length === 0 ? (
          <EmptyState text="Henüz öğretmen eklenmedi." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Öğretmen</Th>
                <Th>Ücret</Th>
                <Th>Ders Sayısı</Th>
                <Th>Ödenecek</Th>
                <Th>Ödenen</Th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => {
                const unpaid = t.lessons
                  .filter((l) => !l.paid)
                  .reduce((a, l) => a + l.fee, 0);
                const paid = t.lessons
                  .filter((l) => l.paid)
                  .reduce((a, l) => a + l.fee, 0);
                return (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <Td className="font-medium text-slate-800">
                      <Link href={`/teachers/${t.id}`} className="hover:text-brand-600">
                        {t.name}
                      </Link>
                    </Td>
                    <Td>
                      {t.rate.toLocaleString("tr-TR")}₺{" "}
                      <Badge value={t.rateType} />
                    </Td>
                    <Td>{t.lessons.length}</Td>
                    <Td className="text-rose-600 font-medium">
                      {unpaid.toLocaleString("tr-TR")}₺
                    </Td>
                    <Td className="text-emerald-600 font-medium">
                      {paid.toLocaleString("tr-TR")}₺
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
