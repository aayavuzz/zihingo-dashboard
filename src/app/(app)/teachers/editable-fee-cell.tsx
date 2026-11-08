"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { updateLessonFee } from "./actions";

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
      const popoverWidth = 220;
      const popoverHeight = 130;
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
        className="fixed z-50 w-56 rounded-xl bg-white shadow-xl ring-1 ring-slate-200 p-3.5"
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

export function EditableLessonFeeCell({
  lessonId,
  fee,
  teacherId,
}: {
  lessonId: string;
  fee: number;
  teacherId: string;
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
        className="font-medium text-slate-800 hover:text-brand-600 hover:underline underline-offset-2"
      >
        {formatTL(fee)}
      </button>

      <Popover open={open} pos={pos} onClose={() => setOpen(false)}>
        <form
          action={(fd: FormData) => {
            startTransition(async () => {
              await updateLessonFee(lessonId, teacherId, fd);
              setOpen(false);
            });
          }}
          className="space-y-2.5"
        >
          <div className="text-[11px] font-semibold text-brand-600 uppercase tracking-wide">
            Ücreti Düzenle
          </div>
          <div>
            <label className={fieldLabel}>Tutar (₺)</label>
            <input
              name="fee"
              type="number"
              step="0.01"
              defaultValue={fee}
              autoFocus
              className={fieldClass}
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-brand-600 text-white text-xs font-medium py-1.5 hover:bg-brand-700 disabled:opacity-50"
          >
            Kaydet
          </button>
        </form>
      </Popover>
    </>
  );
}
