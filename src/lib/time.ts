// Sunucu (Vercel) UTC'de çalışıyor ama kullanıcılar Türkiye saatine göre
// tarih/saat giriyor. Türkiye 2016'dan beri yaz saati uygulamıyor, sabit
// UTC+3'te — bu yüzden sabit bir ofset eklemek yeterli ve doğru.
export function parseTurkeyDateTime(dateStr: string, timeStr: string): Date | null {
  const dt = new Date(`${dateStr}T${timeStr}:00+03:00`);
  return isNaN(dt.getTime()) ? null : dt;
}

const TURKEY_OFFSET_MS = 3 * 60 * 60 * 1000;

// Verilen anı Türkiye saatine kaydırıp UTC getter'larıyla okuyoruz; böylece
// sunucunun kendi local timezone'u (Vercel'de UTC) hesaba karışmıyor.
function turkeyShifted(d: Date = new Date()) {
  return new Date(d.getTime() + TURKEY_OFFSET_MS);
}

export function turkeyDateStr(d: Date = new Date()): string {
  return turkeyShifted(d).toISOString().slice(0, 10);
}

export function turkeyTimeStr(d: Date = new Date()): string {
  return turkeyShifted(d).toISOString().slice(11, 16);
}

// 0=Pazartesi..6=Pazar (WEEKDAYS_TR sırası)
export function turkeyWeekdayMon0(d: Date = new Date()): number {
  const jsDay = turkeyShifted(d).getUTCDay(); // 0=Pazar..6=Cumartesi
  return (jsDay + 6) % 7;
}
