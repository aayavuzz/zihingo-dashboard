// Sunucu (Vercel) UTC'de çalışıyor ama kullanıcılar Türkiye saatine göre
// tarih/saat giriyor. Türkiye 2016'dan beri yaz saati uygulamıyor, sabit
// UTC+3'te — bu yüzden sabit bir ofset eklemek yeterli ve doğru.
export function parseTurkeyDateTime(dateStr: string, timeStr: string): Date | null {
  const dt = new Date(`${dateStr}T${timeStr}:00+03:00`);
  return isNaN(dt.getTime()) ? null : dt;
}
