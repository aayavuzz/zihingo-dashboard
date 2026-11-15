"use client";

import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

export function MobileNav({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="ZihinGO" className="w-7 h-7 shrink-0" />
          <span className="text-sm font-bold text-slate-900">ZihinGO</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          aria-label="Menüyü aç"
        >
          <Menu size={22} />
        </button>
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
    </>
  );
}
