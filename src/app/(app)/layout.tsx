import {
  CalendarDays,
  CreditCard,
  GraduationCap,
  Layers,
  LayoutDashboard,
  ListChecks,
  LogOut,
  ScrollText,
  User,
  Users,
  UsersRound,
} from "lucide-react";
import { NavLink } from "@/components/nav-link";
import { MobileNav } from "@/components/mobile-nav";
import { logout } from "@/app/login/actions";
import { getSession } from "@/lib/session";

const iconProps = { size: 17, strokeWidth: 2 };
const navItems = [
  { href: "/", label: "Panel", icon: <LayoutDashboard {...iconProps} /> },
  { href: "/takip-listesi", label: "Takip Listesi", icon: <ListChecks {...iconProps} /> },
  { href: "/students", label: "Öğrenciler", icon: <GraduationCap {...iconProps} /> },
  { href: "/groups", label: "Gruplar", icon: <UsersRound {...iconProps} /> },
  { href: "/courses", label: "Kurlar", icon: <Layers {...iconProps} /> },
  { href: "/payments", label: "Ödemeler", icon: <CreditCard {...iconProps} />, adminOnly: true },
  { href: "/schedule", label: "Haftalık Program", icon: <CalendarDays {...iconProps} /> },
  { href: "/profil", label: "Profil", icon: <User {...iconProps} /> },
  { href: "/teachers", label: "Öğretmenler", icon: <Users {...iconProps} />, adminOnly: true },
  { href: "/loglar", label: "Loglar", icon: <ScrollText {...iconProps} />, superAdminOnly: true },
];

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  const visibleNavItems = navItems
    .filter((item) => {
      if (item.adminOnly && session?.role === "teacher") return false;
      if (item.superAdminOnly && session?.role !== "superadmin") return false;
      return true;
    })
    .map((item) =>
      item.href === "/profil" && session?.role === "superadmin"
        ? { ...item, label: "Kullanıcılar" }
        : item
    );

  const sidebarInner = (
    <>
      <div className="px-5 h-16 flex items-center gap-2.5 border-b border-slate-100 shrink-0">
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
      <div className="border-t border-slate-100 shrink-0">
        <div className="px-5 py-3 flex items-center gap-2.5">
          {session?.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.photoUrl}
              alt=""
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
              {(session?.name ?? session?.email ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-700 truncate">
              {session?.name ?? session?.email ?? "—"}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {session?.role === "superadmin"
                ? "Süper Admin"
                : session?.role === "admin"
                  ? "Admin"
                  : "Öğretmen"}
            </div>
          </div>
        </div>
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
    </>
  );

  return (
    <div className="min-h-full flex flex-col md:flex-row bg-slate-100 text-slate-900">
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-slate-200/80 bg-white min-h-screen">
        {sidebarInner}
      </aside>

      <MobileNav>{sidebarInner}</MobileNav>

      <main className="flex-1 min-h-screen min-w-0">
        <div className="max-w-full px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
