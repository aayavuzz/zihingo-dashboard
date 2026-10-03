import {
  CalendarDays,
  CreditCard,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  Users,
  UsersRound,
} from "lucide-react";
import { NavLink } from "@/components/nav-link";
import { logout } from "@/app/login/actions";
import { getSession } from "@/lib/session";

const iconProps = { size: 17, strokeWidth: 2 };
const navItems = [
  { href: "/", label: "Panel", icon: <LayoutDashboard {...iconProps} /> },
  { href: "/students", label: "Öğrenciler", icon: <GraduationCap {...iconProps} /> },
  { href: "/groups", label: "Gruplar", icon: <UsersRound {...iconProps} /> },
  { href: "/courses", label: "Kurlar", icon: <Layers {...iconProps} /> },
  { href: "/payments", label: "Ödemeler", icon: <CreditCard {...iconProps} /> },
  { href: "/schedule", label: "Haftalık Program", icon: <CalendarDays {...iconProps} /> },
  { href: "/teachers", label: "Öğretmenler", icon: <Users {...iconProps} />, adminOnly: true },
];

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || session?.role !== "teacher");

  return (
    <div className="min-h-full flex bg-slate-100 text-slate-900">
      <aside className="w-64 shrink-0 border-r border-slate-200/80 bg-white min-h-screen flex flex-col">
        <div className="px-5 h-16 flex items-center gap-2.5 border-b border-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="ZihinGO" className="w-9 h-9 shrink-0" />
          <div>
            <div className="text-sm font-bold text-slate-900 leading-tight">ZihinGO</div>
            <div className="text-[11px] text-slate-400 leading-tight">Yönetim Paneli</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {visibleNavItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </nav>
        <div className="border-t border-slate-100">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-5 py-3 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut size={15} strokeWidth={2} />
              Çıkış Yap
            </button>
          </form>
          <div className="px-5 py-3 text-[11px] text-slate-400 border-t border-slate-100">
            Methodda tarafından geliştirildi
          </div>
        </div>
      </aside>
      <main className="flex-1 min-h-screen">
        <div className="max-w-full px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
