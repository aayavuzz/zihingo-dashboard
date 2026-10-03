"use client";

import { useEffect } from "react";

// Tüm sayfalardaki <details> tabanlı popover/accordion'lar için ortak davranış:
// açıkken dışarıya (boş bir alana) tıklanınca kapansın.
export function CloseDetailsOnOutsideClick() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      document.querySelectorAll("details[open]").forEach((el) => {
        const details = el as HTMLDetailsElement;
        if (!details.contains(target)) {
          details.open = false;
        }
      });
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
