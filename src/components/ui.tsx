import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-7 pb-5 border-b border-slate-200/80">
      <div>
        <h1 className="text-[1.35rem] font-bold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl ring-1 ring-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

const statToneClasses: Record<string, string> = {
  default: "text-slate-900",
  good: "text-emerald-600",
  warn: "text-amber-600",
  bad: "text-rose-600",
};

const statIconTone: Record<string, string> = {
  default: "bg-slate-100 text-slate-500",
  good: "bg-emerald-50 text-emerald-600",
  warn: "bg-amber-50 text-amber-600",
  bad: "bg-rose-50 text-rose-600",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
  icon?: ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </div>
        {icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${statIconTone[tone]}`}>
            {icon}
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold mt-1.5 tracking-tight ${statToneClasses[tone]}`}>
        {value}
      </div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </Card>
  );
}

// Öğrenci listelerinde sıralama: Aktif üstte, Pasif en altta.
export const studentStatusOrder: Record<string, number> = {
  Aktif: 0,
  Bekleyen: 1,
  Pasif: 2,
};

const badgeTones: Record<string, string> = {
  Aktif: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15",
  Bekleyen: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/15",
  Pasif: "bg-slate-100 text-slate-600 ring-1 ring-slate-500/10",
  Odendi: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15",
  Bekliyor: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/15",
  Odenmedi: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/15",
  Olumlu: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15",
  Olumsuz: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/15",
  TakipAramasi: "bg-brand-50 text-brand-700 ring-1 ring-brand-600/15",
  Ulasilamadi: "bg-slate-100 text-slate-600 ring-1 ring-slate-500/10",
};

export const badgeLabels: Record<string, string> = {
  Odendi: "Ödendi",
  Bekliyor: "Bekliyor",
  Odenmedi: "Ödenmedi",
  TakipAramasi: "Takip Araması",
  Ulasilamadi: "Ulaşılamadı",
  Olumlu: "Olumlu",
  Olumsuz: "Olumsuz",
  Normal: "Normal",
  OkulOncesi: "Okul Öncesi",
  PerLesson: "Ders Başına",
  PerHour: "Saat Başına",
};

export function Badge({ value }: { value: string }) {
  const cls = badgeTones[value] ?? "bg-slate-100 text-slate-600 ring-1 ring-slate-500/10";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {badgeLabels[value] ?? value}
    </span>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">{children}</table>
    </div>
  );
}

export function Th({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-2.5 font-semibold text-slate-500 text-[11px] uppercase tracking-wide bg-slate-50/80 border-b border-slate-200 whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
  title,
}: {
  children?: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <td
      title={title}
      className={`px-4 py-2.5 border-b border-slate-100 align-middle ${className}`}
    >
      {children}
    </td>
  );
}

export const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-400 bg-white transition-shadow";

export const labelClass = "block text-xs font-medium text-slate-600 mb-1";

export function Button({
  children,
  variant = "primary",
  type = "submit",
  className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  type?: "submit" | "button";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50";
  const variants: Record<string, string> = {
    primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700",
    secondary: "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100",
    ghost: "text-slate-500 hover:bg-slate-100",
  };
  return (
    <button type={type} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

// <summary> ile birlikte kullanılır: gerçek <button> summary'nin native
// aç/kapa davranışını yutar, bu yüzden aynı görünümde bir <span> kullanılır.
export function SummaryButton({
  children,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "cell";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg transition-colors cursor-pointer select-none";
  const variants: Record<string, string> = {
    primary: "px-3.5 py-2 text-sm font-medium bg-brand-600 text-white shadow-sm hover:bg-brand-700",
    secondary:
      "px-3.5 py-2 text-sm font-medium bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50",
    ghost: "px-2 py-1 text-xs font-medium text-slate-400 hover:text-brand-600 hover:bg-brand-50",
    cell: "w-full px-2 py-1.5 rounded-md",
  };
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}

export function EmptyState({ text }: { text: string }) {
  return <div className="py-10 text-center text-sm text-slate-400">{text}</div>;
}
