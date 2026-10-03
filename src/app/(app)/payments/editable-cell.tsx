"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { addInstallment, deleteInstallment, updateInstallment } from "@/app/(app)/students/actions";

type Installment = {
  id: string;
  index: number;
  amount: number;
  status: string;
  note: string | null;
  paidDate: string | null;
};

const cellTone: Record<string, string> = {
  Odendi: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15",
  Bekliyor: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/15",
  Odenmedi: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/15",
};

function formatTL(n: number) {
  return n.toLocaleString("tr-TR") + "₺";
}

function usePopoverPosition(open: boolean, anchorRef: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }

    // Popover position: fixed olduğu için viewport'a göre konumlanır,
    // sayfa kaydırma miktarı (scrollX/scrollY) eklenmemeli.
    function updatePosition() {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const popoverWidth = 280;
      const popoverHeight = 340;
      const left = Math.min(rect.left, window.innerWidth - popoverWidth - 8);
      const openUpward = rect.bottom + popoverHeight + 8 > window.innerHeight;
      const top = openUpward ? rect.top - popoverHeight - 6 : rect.bottom + 6;
      setPos({ top: Math.max(8, top), left: Math.max(8, left) });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, anchorRef]);

  return pos;
}

function Popover({
  open,
  pos,
  onClose,
  children,
}: {
  open: boolean;
  pos: { top: number; left: number } | null;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open || !pos || typeof document === "undefined") return null;
  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        style={{ top: pos.top, left: pos.left }}
        className="fixed z-50 w-64 rounded-xl bg-white shadow-xl ring-1 ring-slate-200 p-3.5"
      >
        {children}
      </div>
    </>,
    document.body
  );
}

const fieldClass =
  "w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-400";
const fieldLabel = "block text-[11px] font-medium text-slate-500 mb-1";

export function EditableInstallmentCell({
  installment,
  studentId,
}: {
  installment: Installment;
  studentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const btnRef = useRef<HTMLButtonElement>(null);
  const pos = usePopoverPosition(open, btnRef);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`group relative block w-full rounded-md px-2 py-1.5 text-xs font-semibold transition hover:ring-2 hover:ring-brand-300 ${cellTone[installment.status]}`}
      >
        <div>{formatTL(installment.amount)}</div>
        {installment.note && (
          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-slate-900 text-white text-[11px] font-medium px-2 py-1 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-100 z-30">
            {installment.note}
          </span>
        )}
      </button>

      <Popover open={open} pos={pos} onClose={() => setOpen(false)}>
        <form
          action={(fd: FormData) => {
            startTransition(async () => {
              await updateInstallment(installment.id, studentId, fd);
              setOpen(false);
            });
          }}
          className="space-y-2.5"
        >
          <div className="text-[11px] font-semibold text-brand-600 uppercase tracking-wide">
            {installment.index}. Kur
          </div>
          <div>
            <label className={fieldLabel}>Tutar (₺)</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              defaultValue={installment.amount}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={fieldLabel}>Durum</label>
            <select name="status" defaultValue={installment.status} className={fieldClass}>
              <option value="Odendi">Ödendi</option>
              <option value="Bekliyor">Bekliyor</option>
              <option value="Odenmedi">Ödenmedi</option>
            </select>
          </div>
          <div>
            <label className={fieldLabel}>Ödeme Tarihi</label>
            <input
              name="paidDate"
              type="date"
              defaultValue={installment.paidDate ?? ""}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={fieldLabel}>Bu kur ne için? (açıklama)</label>
            <input
              name="note"
              defaultValue={installment.note ?? ""}
              placeholder="Örn: Şubat ayı / 3. modül"
              className={fieldClass}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-md bg-brand-600 text-white text-xs font-medium py-1.5 hover:bg-brand-700 disabled:opacity-50"
            >
              Kaydet
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await deleteInstallment(installment.id, studentId);
                  setOpen(false);
                })
              }
              className="rounded-md bg-rose-50 text-rose-600 text-xs font-medium px-3 hover:bg-rose-100 disabled:opacity-50"
            >
              Sil
            </button>
          </div>
        </form>
      </Popover>
    </>
  );
}

export function AddInstallmentButton({
  studentId,
  nextIndex,
}: {
  studentId: string;
  nextIndex: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const btnRef = useRef<HTMLButtonElement>(null);
  const pos = usePopoverPosition(open, btnRef);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={`${nextIndex}. Kur ekle`}
        className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition"
      >
        <Plus size={15} />
      </button>

      <Popover open={open} pos={pos} onClose={() => setOpen(false)}>
        <form
          action={(fd: FormData) => {
            startTransition(async () => {
              await addInstallment(studentId, fd);
              setOpen(false);
            });
          }}
          className="space-y-2.5"
        >
          <div className="text-[11px] font-semibold text-brand-600 uppercase tracking-wide">
            {nextIndex}. Kur Ekle
          </div>
          <div>
            <label className={fieldLabel}>Tutar (₺)</label>
            <input name="amount" type="number" step="0.01" required autoFocus className={fieldClass} />
          </div>
          <div>
            <label className={fieldLabel}>Durum</label>
            <select name="status" defaultValue="Bekliyor" className={fieldClass}>
              <option value="Odendi">Ödendi</option>
              <option value="Bekliyor">Bekliyor</option>
              <option value="Odenmedi">Ödenmedi</option>
            </select>
          </div>
          <div>
            <label className={fieldLabel}>Ödeme Tarihi</label>
            <input name="paidDate" type="date" className={fieldClass} />
          </div>
          <div>
            <label className={fieldLabel}>Bu kur ne için? (açıklama)</label>
            <input name="note" placeholder="Örn: Mart ayı / 4. modül" className={fieldClass} />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-brand-600 text-white text-xs font-medium py-1.5 hover:bg-brand-700 disabled:opacity-50"
          >
            Ekle
          </button>
        </form>
      </Popover>
    </>
  );
}
