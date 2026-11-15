import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const entityLabels: Record<string, string> = {
  Student: "Öğrenci",
  Installment: "Ödeme",
  Lead: "Takip Listesi",
  Lesson: "Ders Kaydı",
  ScheduleSession: "Program",
  Teacher: "Öğretmen",
  Group: "Grup",
  Course: "Kur",
  StudentCourse: "Öğrenci Kursu",
  User: "Kullanıcı",
};

const actionLabels: Record<string, { text: string; tone: string }> = {
  create: { text: "Oluşturdu", tone: "text-emerald-600 bg-emerald-50 ring-emerald-600/15" },
  update: { text: "Güncelledi", tone: "text-amber-600 bg-amber-50 ring-amber-600/15" },
  delete: { text: "Sildi", tone: "text-rose-600 bg-rose-50 ring-rose-600/15" },
};

const rowCols = "grid grid-cols-[150px_120px_140px_1fr] items-center gap-3";

export default async function LoglarPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  const session = await getSession();
  if (session?.role !== "superadmin") redirect("/");

  const { entity } = await searchParams;

  const logs = await prisma.auditLog.findMany({
    where: entity ? { entity } : undefined,
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const entityOptions = Object.keys(entityLabels);

  return (
    <div>
      <PageHeader
        title="Loglar"
        description="Panelde yapılan son 300 değişiklik — kim, ne zaman, neyi değiştirdi"
      />

      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        <a
          href="/loglar"
          className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
            !entity
              ? "bg-brand-600 text-white border-brand-600"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Tümü
        </a>
        {entityOptions.map((e) => (
          <a
            key={e}
            href={`/loglar?entity=${e}`}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
              entity === e
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {entityLabels[e]}
          </a>
        ))}
      </div>

      <Card>
        {logs.length === 0 ? (
          <EmptyState text="Henüz kayıt yok." />
        ) : (
          <div>
            <div
              className={`${rowCols} px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wide`}
            >
              <span>Tarih / Saat</span>
              <span>İşlem</span>
              <span>Varlık</span>
              <span>Detay</span>
            </div>
            {logs.map((l) => {
              const a = actionLabels[l.action] ?? { text: l.action, tone: "text-slate-600 bg-slate-50 ring-slate-600/15" };
              return (
                <div
                  key={l.id}
                  className={`${rowCols} px-4 py-2.5 text-sm border-b border-slate-100 last:border-b-0`}
                >
                  <span className="text-slate-500 text-xs">
                    {l.createdAt.toLocaleString("tr-TR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center w-fit px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${a.tone}`}
                  >
                    {a.text}
                  </span>
                  <span className="text-slate-600 text-xs">
                    {entityLabels[l.entity] ?? l.entity}
                  </span>
                  <span className="text-slate-700 truncate" title={l.label ?? ""}>
                    {l.label ?? "—"}
                    <span className="text-slate-400"> · {l.actorEmail ?? "bilinmiyor"}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
