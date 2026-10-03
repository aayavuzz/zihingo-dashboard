import type { ReactNode } from "react";
import { CourseIcon } from "@/lib/course-icons";

function formatTL(n: number) {
  return n.toLocaleString("tr-TR") + "₺";
}

// Tek satırlık, parça-bütün özeti: tek bir yuvarlatılmış çubuk + altında lejant.
// "Part-to-whole at a glance" için bar/lejant kombinasyonu; pasta/donut yerine.
export function StackedBarSummary({
  segments,
  formatValue = (v: number) => v.toLocaleString("tr-TR"),
}: {
  segments: { label: string; value: number; colorClass: string }[];
  formatValue?: (v: number) => string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const visible = segments.filter((s) => s.value > 0);

  return (
    <div>
      <div className="flex h-5 rounded-full overflow-hidden bg-slate-100 gap-0.5">
        {total === 0 ? (
          <div className="flex-1" />
        ) : (
          visible.map((s) => (
            <div
              key={s.label}
              className={s.colorClass}
              style={{ width: `${(s.value / total) * 100}%` }}
              title={`${s.label}: ${formatValue(s.value)}`}
            />
          ))
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs">
            <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${s.colorClass}`} />
            <span className="text-slate-500">{s.label}</span>
            <span className="font-semibold text-slate-800">{formatValue(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Kurs başına Aktif / Tamamlandı dağılımı - yatay, uzunluğu toplam kayda oranlı çubuklar.
export function CourseProgressBars({
  rows,
}: {
  rows: {
    id: string;
    name: string;
    icon: string;
    active: number;
    completed: number;
  }[];
}) {
  const sorted = [...rows]
    .map((r) => ({ ...r, total: r.active + r.completed }))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total);
  const max = Math.max(...sorted.map((r) => r.total), 1);

  if (sorted.length === 0) {
    return <div className="text-sm text-slate-400">Henüz kurs kaydı yok.</div>;
  }

  return (
    <div>
      <div className="space-y-2.5">
        {sorted.map((r) => (
          <div key={r.id} className="flex items-center gap-3">
            <div className="w-32 shrink-0 flex items-center gap-1.5 text-xs text-slate-600">
              <CourseIcon name={r.icon} size={12} className="text-slate-400 shrink-0" />
              <span className="truncate">{r.name}</span>
            </div>
            <div className="flex-1 h-4 flex items-center">
              <div
                className="h-full rounded-full bg-slate-100 overflow-hidden flex gap-0.5"
                style={{ width: `${(r.total / max) * 100}%` }}
                title={`${r.name} — Aktif: ${r.active}, Tamamlandı: ${r.completed}`}
              >
                {r.active > 0 && (
                  <div className="h-full bg-brand-600" style={{ width: `${(r.active / r.total) * 100}%` }} />
                )}
                {r.completed > 0 && (
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(r.completed / r.total) * 100}%` }}
                  />
                )}
              </div>
            </div>
            <div className="w-6 shrink-0 text-xs font-medium text-slate-500 text-right">
              {r.total}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-slate-100">
        <Legend colorClass="bg-brand-600" label="Aktif" />
        <Legend colorClass="bg-emerald-500" label="Tamamlandı" />
      </div>
    </div>
  );
}

function Legend({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${colorClass}`} />
      <span className="text-slate-500">{label}</span>
    </div>
  );
}

export function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-5">
      <h2 className="font-semibold text-slate-800">{title}</h2>
      <p className="text-xs text-slate-400 mt-0.5 mb-4">{description ?? " "}</p>
      {children}
    </div>
  );
}

export { formatTL };
