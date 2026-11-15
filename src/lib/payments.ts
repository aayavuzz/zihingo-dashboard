export type InstallmentLike = {
  status: string;
  amount: number;
  paidAmount?: number | null;
};

// Bir taksidin ödenen / bekleyen / ödenmeyen kırılımı.
// "KismiOdendi" durumunda ödenen kısım "paid"e, kalan kısım "pending"e eklenir.
export function installmentBreakdown(i: InstallmentLike) {
  if (i.status === "Odendi") return { paid: i.amount, pending: 0, unpaid: 0 };
  if (i.status === "Odenmedi") return { paid: 0, pending: 0, unpaid: i.amount };
  if (i.status === "KismiOdendi") {
    const paid = Math.min(i.paidAmount ?? 0, i.amount);
    return { paid, pending: i.amount - paid, unpaid: 0 };
  }
  return { paid: 0, pending: i.amount, unpaid: 0 };
}
