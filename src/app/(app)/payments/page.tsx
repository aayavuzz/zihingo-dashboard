import Link from "next/link";
import { Banknote, CircleDollarSign, TrendingUp, Wallet } from "lucide-react";
import { prisma } from "@/lib/db";
import { Badge, Card, EmptyState, PageHeader, StatCard, Table, Th } from "@/components/ui";
import { AddInstallmentButton, EditableInstallmentCell } from "./editable-cell";

export const dynamic = "force-dynamic";

function formatTL(n: number) {
  return n.toLocaleString("tr-TR") + "₺";
}

export default async function PaymentsPage() {
  const students = await prisma.student.findMany({
    include: { installments: { orderBy: { index: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  const all = students.flatMap((s) => s.installments);
  const totals = {
    Odendi: all.filter((i) => i.status === "Odendi").reduce((a, i) => a + i.amount, 0),
    Bekliyor: all.filter((i) => i.status === "Bekliyor").reduce((a, i) => a + i.amount, 0),
    Odenmedi: all.filter((i) => i.status === "Odenmedi").reduce((a, i) => a + i.amount, 0),
  };

  const maxKur = students.reduce(
    (max, s) => Math.max(max, ...s.installments.map((i) => i.index), 0),
    0
  );
  // En az 1 boş "ekle" sütunu olsun ki her satırda + butonu görünsün.
  const kurColumns = Array.from({ length: maxKur + 1 }, (_, i) => i + 1);
  const relevantStudents = students;

  return (
    <div>
      <PageHeader
        title="Ödemeler"
        description="Her öğrencinin kur / taksit ödemeleri — bir tutara tıklayarak düzenleyebilir, satır sonundaki + ile yeni kur ekleyebilirsin"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Ödenen"
          value={formatTL(totals.Odendi)}
          tone="good"
          icon={<Banknote size={15} />}
        />
        <StatCard
          label="Bekleyen"
          value={formatTL(totals.Bekliyor)}
          tone="warn"
          icon={<Wallet size={15} />}
        />
        <StatCard
          label="Ödenmeyen"
          value={formatTL(totals.Odenmedi)}
          tone="bad"
          icon={<CircleDollarSign size={15} />}
        />
        <StatCard
          label="Toplam Kasa"
          value={formatTL(totals.Odendi + totals.Bekliyor + totals.Odenmedi)}
          icon={<TrendingUp size={15} />}
        />
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
        <span className="font-medium text-slate-600">Durum:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Ödendi
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Bekliyor
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" /> Ödenmedi
        </span>
        <span className="text-slate-300">·</span>
        <span>Bir tutara tıkla → düzenle / sil</span>
      </div>

      <Card>
        {relevantStudents.length === 0 ? (
          <EmptyState text="Kayıt bulunamadı." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th className="sticky left-0 bg-slate-50/80 z-10">Öğrenci</Th>
                {kurColumns.map((k) => (
                  <Th key={k} className="text-center">
                    {k}. Kur
                  </Th>
                ))}
                <Th className="text-right">Toplam</Th>
              </tr>
            </thead>
            <tbody>
              {relevantStudents.map((s, rowIdx) => {
                const byIndex = new Map(s.installments.map((i) => [i.index, i]));
                const total = s.installments.reduce((a, i) => a + i.amount, 0);
                const nextIndex = s.installments.length + 1;
                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-brand-50/40 ${rowIdx % 2 === 1 ? "bg-slate-50/40" : ""} ${s.status === "Pasif" ? "opacity-60" : ""}`}
                  >
                    <td className="px-4 py-2 border-b border-slate-100 align-middle font-medium text-slate-800 sticky left-0 bg-inherit whitespace-nowrap">
                      <Link href={`/students/${s.id}`} className="hover:text-brand-600 inline-flex items-center gap-2">
                        {s.name}
                        {s.status !== "Aktif" && <Badge value={s.status} />}
                      </Link>
                    </td>
                    {kurColumns.map((k) => {
                      const inst = byIndex.get(k);
                      return (
                        <td key={k} className="px-2 py-1.5 border-b border-slate-100 align-middle text-center">
                          {inst ? (
                            <EditableInstallmentCell installment={inst} studentId={s.id} />
                          ) : k === nextIndex ? (
                            <div className="flex justify-center">
                              <AddInstallmentButton studentId={s.id} nextIndex={nextIndex} />
                            </div>
                          ) : (
                            <span className="text-slate-200">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2 border-b border-slate-100 align-middle text-right font-semibold text-slate-800 whitespace-nowrap">
                      {formatTL(total)}
                    </td>
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
