"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";

export type NavTab = {
  href: string;
  label: string;
  icon: ReactNode;
};

export function MobileNav({ children, tabs }: { children: ReactNode; tabs: NavTab[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <div className="md:hidden sticky top-0 z-30 flex items-center h-14 px-4 bg-white border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="ZihinGO" className="w-7 h-7 shrink-0" />
          <span className="text-sm font-bold text-slate-900">ZihinGO</span>
        </div>
      </div>

      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-xl flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-end px-3 h-14 border-b border-slate-100 shrink-0">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            aria-label="Menüyü kapat"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto" onClick={() => setOpen(false)}>
          {children}
        </div>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200/80 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch h-16">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                  active ? "text-brand-600" : "text-slate-400"
                }`}
              >
                {tab.icon}
                {tab.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-slate-400"
          >
            <MoreHorizontal size={20} strokeWidth={2} />
            Diğer
          </button>
        </div>
      </nav>
    </>
  );
}
