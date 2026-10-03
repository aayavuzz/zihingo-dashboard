export const WEEKDAYS_TR = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

export const WEEKDAYS_SHORT_TR = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export const MONTHS_TR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

// JS: 0=Pazar..6=Cumartesi -> Pazartesi=0..Pazar=6 sırasına çevir
export function weekdayIndexMon0(date: Date) {
  return (date.getDay() + 6) % 7;
}

export function weekdayNameFromDate(date: Date) {
  return WEEKDAYS_TR[weekdayIndexMon0(date)];
}

export function formatISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Ayı kapsayan, Pazartesi başlangıçlı tam hafta satırları (önceki/sonraki aydan taşan günler dahil) */
export function getMonthGridWeeks(year: number, month: number): Date[][] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = weekdayIndexMon0(firstOfMonth);
  const gridStart = new Date(year, month, 1 - startOffset);

  const weeks: Date[][] = [];
  const cursor = new Date(gridStart);
  // 6 hafta, 42 gün her zaman tüm ayı kapsar
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function getWeekDates(year: number, month: number, day: number): Date[] {
  const target = new Date(year, month, day);
  const startOffset = weekdayIndexMon0(target);
  const start = new Date(year, month, day - startOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(start);
    dt.setDate(start.getDate() + i);
    return dt;
  });
}

export function addMonths(year: number, month: number, delta: number) {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}
