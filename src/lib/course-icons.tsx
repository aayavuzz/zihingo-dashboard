import {
  Box,
  Brain,
  Camera,
  Cat,
  Code2,
  Cpu,
  FlaskConical,
  Gamepad2,
  Globe,
  Music,
  Palette,
  Puzzle,
  Rocket,
  ShieldCheck,
  Shapes,
  Sparkles,
  Star,
  Users,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export const COURSE_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Box,
  Shapes,
  FlaskConical,
  Cpu,
  Palette,
  Gamepad2,
  ShieldCheck,
  Globe,
  Brain,
  Cat,
  Code2,
  Rocket,
  Sparkles,
  Music,
  Camera,
  Puzzle,
  Users,
  Star,
};

export const COURSE_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "BookOpen", label: "Genel Ders" },
  { value: "Box", label: "3D / Modelleme" },
  { value: "Shapes", label: "Tasarım / Blender" },
  { value: "FlaskConical", label: "Bilim / Deney" },
  { value: "Cpu", label: "Elektronik / Devre" },
  { value: "Palette", label: "Dijital İllüstrasyon" },
  { value: "Gamepad2", label: "Oyun Geliştirme" },
  { value: "ShieldCheck", label: "Siber Güvenlik" },
  { value: "Globe", label: "Web / İnternet" },
  { value: "Brain", label: "Yapay Zeka" },
  { value: "Cat", label: "Scratch" },
  { value: "Code2", label: "Kodlama" },
  { value: "Rocket", label: "İleri Seviye" },
  { value: "Sparkles", label: "Özel Atölye" },
  { value: "Music", label: "Müzik" },
  { value: "Camera", label: "Video / Prodüksiyon" },
  { value: "Puzzle", label: "Mantık / Bulmaca" },
  { value: "Users", label: "Birebir Ders" },
  { value: "Star", label: "Bireysel Program" },
];

// Kur formunda ikonun kendisini gösterip seçtiren görsel seçici (native <select> yerine).
export function IconPicker({
  name = "icon",
  defaultValue = "BookOpen",
}: {
  name?: string;
  defaultValue?: string;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(2.25rem,1fr))] gap-1.5 p-2 rounded-lg border border-slate-200 bg-slate-50/60 max-h-48 overflow-y-auto">
      {COURSE_ICON_OPTIONS.map((opt) => (
        <label key={opt.value} title={opt.label} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt.value}
            defaultChecked={opt.value === defaultValue}
            className="peer sr-only"
          />
          <span className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 ring-1 ring-slate-200 bg-white hover:bg-slate-100 peer-checked:bg-brand-600 peer-checked:text-white peer-checked:ring-brand-600 transition-colors">
            <CourseIcon name={opt.value} size={16} />
          </span>
        </label>
      ))}
    </div>
  );
}

export function CourseIcon({
  name,
  size = 14,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = COURSE_ICONS[name] ?? BookOpen;
  return <Icon size={size} className={className} />;
}

// İkon rozeti: üzerine gelince kursun adını gösteren tooltip içerir.
export function CourseChip({
  name,
  color,
  icon,
  active = false,
  size = 24,
}: {
  name: string;
  color: string;
  icon: string;
  active?: boolean;
  size?: number;
}) {
  return (
    <span className="relative inline-flex group/tip">
      <span
        className={`rounded-full flex items-center justify-center text-white shrink-0 ${
          active ? "ring-2 ring-offset-1 ring-emerald-500" : "opacity-80"
        }`}
        style={{ backgroundColor: color, width: size, height: size }}
      >
        <CourseIcon name={icon} size={Math.round(size * 0.55)} />
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-slate-900 text-white text-[11px] font-medium px-2 py-1 opacity-0 scale-95 group-hover/tip:opacity-100 group-hover/tip:scale-100 transition-all duration-100 z-20">
        {name}
        {active && <span className="text-emerald-400"> · Aktif</span>}
      </span>
    </span>
  );
}
