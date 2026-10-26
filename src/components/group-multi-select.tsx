"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";

// Kapalıyken tek satırlık, seçilenleri "chip" olarak gösteren; açılınca
// onay kutusu listesi sunan grup çoklu-seçim girişi. Dışarı tıklanınca
// kapanması için native <details>/<summary> kullanır (bkz.
// CloseDetailsOnOutsideClick — uygulama genelinde zaten aktif).
export function GroupMultiSelect({
  groups,
  name = "groupId",
  defaultSelected = [],
}: {
  groups: { id: string; name: string }[];
  name?: string;
  defaultSelected?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <details className="relative">
      {selected.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
      <summary className="list-none cursor-pointer min-h-[38px] flex items-center flex-wrap gap-1 rounded-lg border border-slate-300 px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/30">
        {selected.length === 0 ? (
          <span className="text-sm text-slate-400">Grup seç…</span>
        ) : (
          selected.map((id) => {
            const g = groups.find((gr) => gr.id === id);
            if (!g) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xs font-medium pl-2 pr-1 py-0.5 rounded-md"
              >
                {g.name}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggle(id);
                  }}
                  className="hover:text-brand-900 rounded-sm"
                >
                  <X size={11} />
                </span>
              </span>
            );
          })
        )}
        <ChevronDown size={14} className="ml-auto text-slate-400 shrink-0" />
      </summary>
      <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto p-1">
        {groups.length === 0 ? (
          <div className="text-xs text-slate-400 px-2 py-1.5">Henüz grup yok.</div>
        ) : (
          groups.map((g) => (
            <label
              key={g.id}
              className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-md hover:bg-slate-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(g.id)}
                onChange={() => toggle(g.id)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              {g.name}
            </label>
          ))
        )}
      </div>
    </details>
  );
}
