import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type StudentSeed = {
  name: string;
  status: string;
  age?: number;
  grade?: string;
  course?: string;
  startDate?: string;
  lessonDay?: string;
  lessonTime?: string;
  groupName?: string;
  birthday?: string;
  completedModules?: string;
  installments?: number[];
};

const students: StudentSeed[] = [
  { name: "Zeynep KAYNAK", status: "Aktif", age: 14, grade: "9", course: "Blender", startDate: "12.2.2026", lessonDay: "Cumartesi", lessonTime: "14.00", groupName: "ZeyZey", completedModules: "Yapay Zeka 1, 3D Modelleme, Dijital İllüstrasyon, Devre, Bilim Atölyesi", installments: [8600, 8600, 8600, 8600, 8600, 8600] },
  { name: "Zeynep TURGUT", status: "Aktif", age: 10, grade: "4", course: "Blender", startDate: "20.7.2025", lessonDay: "Cumartesi", lessonTime: "14.00", groupName: "ZeyZey", completedModules: "Yapay Zeka 1, 3D Modelleme, Oyun Geliştirme, Dijital İllüstrasyon, Devre, Bilim Atölyesi", installments: [0, 0, 0, 0, 0, 0, 0] },
  { name: "Ege ŞEN", status: "Aktif", age: 12, grade: "6", course: "Blender", startDate: "14.2.2026", lessonDay: "Cumartesi", lessonTime: "14.00", groupName: "ZeyZey", completedModules: "Yapay Zeka 1, 3D Modelleme, Oyun Geliştirme, Dijital İllüstrasyon, Devre, Bilim Atölyesi", installments: [8600, 8600, 8600, 8600, 8600, 9600, 8600] },
  { name: "Kutay ÖNGEL", status: "Aktif", age: 9, grade: "4", course: "Bilim Atölyesi", startDate: "8.11.2025", lessonDay: "Perşembe", lessonTime: "18.30", groupName: "GS Fan", completedModules: "Yapay Zeka 1, 3D Modelleme, Devre, Scratch, Yapay Zeka 1 (Tekrar), 3D Modelleme (Tekrar), Oyun Geliştirme, Siber Güvenlik", installments: [6400, 6400, 6400, 6400, 6400, 6400, 6400, 6400, 6400] },
  { name: "Barlas ALTUNEL", status: "Aktif", age: 8, grade: "4", course: "Bilim Atölyesi", startDate: "11.6.2026", lessonDay: "Perşembe", lessonTime: "18.30", groupName: "GS Fan", completedModules: "Yapay Zeka 1, 3D Modelleme, Oyun Geliştirme, Siber Güvenlik", installments: [8600, 8600, 8600, 8600, 8600] },
  { name: "Mehmet Emin YAVUZ", status: "Aktif", age: 13, grade: "8", course: "Siber Güvenlik", startDate: "15.4.2026", lessonDay: "Çarşamba", lessonTime: "18.30", groupName: "Jaguar 3lü", birthday: "25/12/2013", completedModules: "Yapay Zeka 1, Oyun Geliştirme, Devre, Bilim Atölyesi, 3D Modelleme", installments: [8500, 8500, 8500, 8500, 8500] },
  { name: "Cihangir AYDIN", status: "Aktif", age: 10, grade: "5", course: "Siber Güvenlik", startDate: "15.4.2026", lessonDay: "Çarşamba", lessonTime: "18.30", groupName: "Jaguar 3lü", birthday: "09/07/2013", completedModules: "Yapay Zeka 1, Oyun Geliştirme, Devre, Bilim Atölyesi, 3D Modelleme", installments: [0, 9300, 10700, 5000, 8600, 8600] },
  { name: "Can ATAN", status: "Aktif", age: 10, grade: "5", course: "Web Sitesi, Siber Güvenlik", startDate: "16.6.2026", lessonDay: "Perşembe", lessonTime: "17.00", groupName: "Grup 01", completedModules: "Yapay Zeka 1, 3D Modelleme, Dijital İllüstrasyon, Oyun 1-1, oyun 1-1 (2), Bilim Atölyesi", installments: [8600, 8600, 10000, 10000, 10000, 10000] },
  { name: "Muhammed Tuğra", status: "Aktif", age: 12, grade: "6", course: "3D Modelleme", startDate: "16.6.2026", lessonDay: "Salı", lessonTime: "18.30", groupName: "Grup 04", completedModules: "Yapay Zeka 1, Dijital İllüstrasyon, Oyun Geliştirme", installments: [8600, 8600, 8600, 8600] },
  { name: "Utkan", status: "Aktif", age: 12, grade: "8", course: "3D Modelleme", startDate: "5.6.2026", lessonDay: "Salı", lessonTime: "18.30", groupName: "Grup 04", completedModules: "Yapay Zeka 1, Dijital İllüstrasyon, Oyun Geliştirme", installments: [5000, 5000, 5000, 5000] },
  { name: "Çınar ÇELİKBALTA", status: "Aktif", age: 14, grade: "8", course: "3D Modelleme", startDate: "14.7.2026", lessonDay: "Salı", lessonTime: "16.00", groupName: "Bireysel 02", completedModules: "Yapay Zeka 1, Oyun Geliştirme, oyun 1-1 (2)", installments: [10000, 10000, 10000, 10000] },
  { name: "Masal SARICA", status: "Aktif", age: 8, grade: "3", course: "Bilim Atölyesi", startDate: "18.7.2026", lessonDay: "Cumartesi", lessonTime: "12.00", groupName: "Grup 03", completedModules: "Yapay Zeka 1, 3D Modelleme", installments: [8600, 8600, 8600] },
  { name: "Simin", status: "Aktif", age: 9, grade: "4", course: "Bilim Atölyesi", startDate: "18.7.2026", lessonDay: "Cumartesi", lessonTime: "12.00", groupName: "Grup 03", completedModules: "Yapay Zeka 1, 3D Modelleme", installments: [8600, 8600, 8600] },
  { name: "Sofia SONGÜL", status: "Aktif", age: 7, grade: "2", course: "3D Modelleme", startDate: "25.7.2026", lessonDay: "Cumartesi", lessonTime: "14.00", groupName: "Grup 02", completedModules: "Yapay Zeka 1, Bilim Atölyesi", installments: [8600, 8600, 8600] },
  { name: "Hüma YAŞAR", status: "Aktif", age: 8, grade: "3", course: "3D Modelleme", startDate: "7.6.2026", lessonDay: "Cumartesi", lessonTime: "14.00", groupName: "Grup 02", completedModules: "Yapay Zeka 1, Dijital İllüstrasyon, Oyun Geliştirme, Bilim Atölyesi", installments: [5000, 5000, 5000, 5000, 5000] },
  { name: "Alperen", status: "Aktif", age: 7, grade: "2", course: "Bilim Atölyesi", startDate: "25.7.2026", lessonDay: "Cumartesi", lessonTime: "11.00", groupName: "Grup 05", completedModules: "Yapay Zeka 1, 3D Modelleme", installments: [8600, 8600, 8600] },
  { name: "Ensar", status: "Aktif", age: 7, grade: "2", course: "Bilim Atölyesi", startDate: "29.07.2026", lessonDay: "Cumartesi", lessonTime: "11.00", groupName: "Grup 05", completedModules: "Yapay Zeka 1, 3D Modelleme", installments: [8950, 8600, 8600] },
  { name: "Emir Kaan", status: "Aktif", age: 12, course: "Oyun Geliştirme", lessonDay: "Salı", lessonTime: "17.00", groupName: "Grup 06", completedModules: "Yapay Zeka 1, 3D Modelleme", installments: [7000, 7500, 7500] },
  { name: "Mert Ali", status: "Aktif", age: 10, course: "Bilim Atölyesi", lessonDay: "Perşembe", lessonTime: "17.00", groupName: "Grup 07", completedModules: "Yapay Zeka 1, 3D Modelleme", installments: [8000, 7500, 7500] },
  { name: "Yiğit Parlak", status: "Aktif", age: 9, grade: "4", course: "Bilim Atölyesi", lessonDay: "Perşembe", lessonTime: "17.00", groupName: "Grup 07", birthday: "06.11.2015", completedModules: "Yapay Zeka 1, 3D Modelleme", installments: [8600, 8600, 8600] },
  { name: "Yiğit GÜNEŞ", status: "Aktif", age: 10, grade: "5", course: "Siber Güvenlik", startDate: "15.4.2026", lessonDay: "Çarşamba", lessonTime: "18.30", groupName: "Jaguar 3lü", birthday: "28/07/2011", completedModules: "Yapay Zeka 1, Oyun Geliştirme, Devre, Bilim Atölyesi", installments: [5000, 5000, 5000, 5000, 5000] },
  { name: "Serhan BENGÜ", status: "Bekleyen", age: 6, lessonTime: "17.00" },
  { name: "Lina ZÜMRÜT", status: "Bekleyen", age: 8, grade: "3", startDate: "11.6.2026", lessonTime: "18.30", installments: [2200] },
  { name: "Işıl", status: "Bekleyen", age: 9, grade: "3" },
  { name: "Mustafa", status: "Bekleyen", age: 8, grade: "3" },
  { name: "Kemal ERDOĞAN", status: "Bekleyen", age: 8, grade: "3" },
];

// Sabit referans hafta (Pazartesi=2026-01-05) — haftalık tekrar eden derslerin başlangıç tarihi olarak kullanılır
const REF_WEEK_DATE: Record<string, string> = {
  Pazartesi: "2026-01-05",
  Salı: "2026-01-06",
  Çarşamba: "2026-01-07",
  Perşembe: "2026-01-08",
  Cuma: "2026-01-09",
  Cumartesi: "2026-01-10",
  Pazar: "2026-01-11",
};

const scheduleSessions = [
  { day: "Pazartesi", time: "17:00", title: "Can (Birebir)", note: "Birebir ders" },
  { day: "Salı", time: "16:00", title: "Çınar ÇELİKBALTA" },
  { day: "Salı", time: "17:00", title: "Emir Kaan" },
  { day: "Salı", time: "18:30", title: "Muhammed Tuğra, Utkan" },
  { day: "Çarşamba", time: "18:30", title: "Mehmet Emin YAVUZ, Cihangir AYDIN, Yiğit GÜNEŞ" },
  { day: "Çarşamba", time: "19:00", title: "Can (Birebir)", note: "Birebir ders" },
  { day: "Perşembe", time: "17:00", title: "Can ATAN" },
  { day: "Perşembe", time: "17:00", title: "Mert Ali, Yiğit Parlak" },
  { day: "Perşembe", time: "18:30", title: "Kutay ÖNGEL, Barlas ALTUNEL" },
  { day: "Cumartesi", time: "11:00", title: "Alperen, Ensar" },
  { day: "Cumartesi", time: "12:00", title: "Masal SARICA, Simin" },
  { day: "Cumartesi", time: "14:00", title: "Zeynep KAYNAK, Zeynep TURGUT, Ege ŞEN" },
  { day: "Cumartesi", time: "14:00", title: "Sofia SONGÜL, Hüma YAŞAR" },
].map((s) => ({ ...s, date: REF_WEEK_DATE[s.day], recurring: true }));

type LeadSeed = {
  type: "Normal" | "OkulOncesi";
  contactName?: string;
  phone?: string;
  status?: string;
  studentName?: string;
  age?: number;
  grade?: string;
  school?: string;
  location?: string;
  firstContactDate?: string;
  lastContactDate?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  note?: string;
};

const leads: LeadSeed[] = [
  { type: "Normal", contactName: "Derste", phone: "Figen veli zigingo", status: "Ulasilamadi", firstContactDate: "02.05.2026", lastContactDate: "04.05.2026" },
  { type: "Normal", contactName: "Gülnaz Zih", phone: "545 512 87 89", status: "Ulasilamadi", firstContactDate: "20.07.2026" },
  { type: "Normal", contactName: "Elif Xih", phone: "536 388 27 64", status: "TakipAramasi", studentName: "Ali Ömer", age: 12, location: "Yıldırım", firstContactDate: "30.04.2026", lastContactDate: "05.05.2026" },
  { type: "Normal", contactName: "Havva CAN", phone: "544 494 56 07", status: "TakipAramasi", age: 7, location: "Korupark", firstContactDate: "30.04.2026", lastContactDate: "05.05.2026" },
  { type: "Normal", contactName: "Sinem ÇAKAN", status: "TakipAramasi", age: 11, firstContactDate: "19.01.2026", lastContactDate: "19.01.2026" },
  { type: "Normal", contactName: "Samet Otomatikkapi", phone: "532 670 69 ..", status: "TakipAramasi", studentName: "Toprak", age: 9, location: "Özlüce", firstContactDate: "02.05.2026", lastContactDate: "05.05.2026" },
  { type: "Normal", contactName: "Hatice BARUT", phone: "507 063 09 77", status: "TakipAramasi", location: "Balat", firstContactDate: "05.05.2026", lastContactDate: "05.05.2026" },
  { type: "Normal", contactName: "Pelin", phone: "536 706 96 89", status: "TakipAramasi", studentName: "Bade", age: 7, location: "Yüzüncüyıl", firstContactDate: "05.05.2026", lastContactDate: "11.05.2026" },
  { type: "Normal", contactName: "Ecem DERELİ", phone: "554 705 77 38", status: "TakipAramasi", age: 5, firstContactDate: "13.07.2026", appointmentDate: "ağustos" },
  { type: "Normal", contactName: "makarasaniz79", phone: "543 918 04 05", status: "TakipAramasi", studentName: "Deniz", age: 7, firstContactDate: "17.07.2026", lastContactDate: "27.07.2026" },
  { type: "Normal", contactName: "Hazel HELVACIOĞLU", phone: "537 989 27 23", status: "Olumsuz", studentName: "Baha", age: 11, location: "Yıldırım", firstContactDate: "29.04.2026", lastContactDate: "01.01.2026" },
  { type: "Normal", contactName: "Sema Ahmet ARHAN", phone: "552 182 25 46", status: "Olumsuz", studentName: "Arhan pars", age: 6, location: "Yunuseli", firstContactDate: "02.05.2026", lastContactDate: "05.05.2026" },
  { type: "Normal", contactName: "Sema Ahmet ARHAN", phone: "552 182 25 46", status: "Olumsuz", studentName: "Ahmet Çınar", age: 8, location: "Yunuseli", firstContactDate: "02.05.2026", lastContactDate: "05.05.2026" },
  { type: "Normal", contactName: "Tuncay", phone: "553 654 43 25", status: "Olumsuz", studentName: "Eslem", age: 5, location: "Yıldırım", firstContactDate: "05.05.2026", lastContactDate: "09.05.2026" },
  { type: "Normal", contactName: "Tuncay", phone: "553 654 43 25", status: "Olumsuz", studentName: "Sümeyye", age: 10, location: "Yıldırım", firstContactDate: "05.05.2026", lastContactDate: "09.05.2026" },
  { type: "Normal", contactName: "Esra Veli Talep", phone: "541 570 38 84", status: "Olumsuz", age: 4 },
  { type: "Normal", contactName: "Necla ÖZSUSEHİRLİ", phone: "554 503 55 40", status: "Olumlu", studentName: "Göktürk", age: 10, location: "Yunuseli", firstContactDate: "14.01.2026", lastContactDate: "14.01.2026", appointmentDate: "03.05.2026", appointmentTime: "15.00" },
  { type: "Normal", contactName: "Emre Tr YAŞAR", status: "Olumlu", studentName: "Hüma", age: 8, grade: "3", location: "İnegöl", lastContactDate: "03.05.2026", appointmentDate: "03.05.2026", appointmentTime: "14.00" },
  { type: "Normal", contactName: "Dilek", status: "Olumlu", studentName: "Barlas", age: 8 },
  { type: "Normal", contactName: "Dilek", status: "Olumlu", studentName: "Utkan", age: 12, grade: "8", firstContactDate: "08.05.2026" },
  { type: "Normal", contactName: "Mesut ÇİFTÇİ", status: "Olumlu", studentName: "Zeynep", age: 7, location: "Yeşil Setbaşı", firstContactDate: "11.05.2026", appointmentTime: "12.00" },
  { type: "Normal", contactName: "Gülçin", phone: "553 361 60 86", status: "Olumlu", studentName: "Kuzey", age: 10 },
  { type: "Normal", contactName: "Hale st", status: "Olumlu", studentName: "sofya", age: 7, grade: "1" },
  { type: "Normal", contactName: "İncifer", status: "Olumlu", studentName: "Simin", age: 9, note: "Kız hafta içi yok hafta sonu uygun ders için kızı ile görüşecek" },
  { type: "OkulOncesi", contactName: "Gülcan NUREL", phone: "539 736 32 62", status: "TakipAramasi", studentName: "Okan NUREL", age: 5, location: "Yakında", firstContactDate: "2.5.2026", lastContactDate: "29.6.2026" },
  { type: "OkulOncesi", contactName: "Betül HANIM", phone: "545 578 04 66", status: "TakipAramasi", studentName: "Eymen", age: 5, location: "23 Nisan", firstContactDate: "2.5.2026" },
  { type: "OkulOncesi", contactName: "Sena VURAL", phone: "545 630 60 28", status: "TakipAramasi", studentName: "Ali Yuşa VURAL", age: 5, firstContactDate: "29.04.2026" },
  { type: "OkulOncesi", contactName: "Betül", phone: "545 578 04 66", status: "TakipAramasi", studentName: "Eymen", age: 5, location: "23 Nisan", firstContactDate: "30.04.2026" },
  { type: "OkulOncesi", contactName: "Yasemin BENGÜ", phone: "532 428 27 20", status: "Olumlu", studentName: "Serhan", age: 6, location: "Balat", firstContactDate: "30.04.2026" },
  { type: "OkulOncesi", contactName: "Sena hnm melikcan annesi", phone: "545 662 77 93", status: "TakipAramasi" },
  { type: "OkulOncesi", contactName: "Gülcan Nurel", studentName: "Okan", age: 5 },
  { type: "OkulOncesi", contactName: "Büşra Efeoğlu KANGAL", studentName: "Eymen", age: 5 },
  { type: "OkulOncesi", contactName: "Büşra hnm(ibocanın annesi)", studentName: "Melina" },
  { type: "OkulOncesi", contactName: "Gülşah 14.09", status: "TakipAramasi", age: 6, lastContactDate: "14.09.2026" },
];

const COURSE_META: Record<string, { icon: string; color: string }> = {
  "3D Modelleme": { icon: "Box", color: "#0891b2" },
  "Bilim Atölyesi": { icon: "FlaskConical", color: "#16a34a" },
  Blender: { icon: "Shapes", color: "#9333ea" },
  Devre: { icon: "Cpu", color: "#d97706" },
  "Dijital İllüstrasyon": { icon: "Palette", color: "#db2777" },
  "Oyun 1-1": { icon: "Users", color: "#64748b" },
  "Oyun Geliştirme": { icon: "Gamepad2", color: "#2563eb" },
  Scratch: { icon: "Cat", color: "#f97316" },
  "Siber Güvenlik": { icon: "ShieldCheck", color: "#dc2626" },
  "Web Sitesi": { icon: "Globe", color: "#0284c7" },
  "Yapay Zeka 1": { icon: "Brain", color: "#502e9f" },
};

function baseCourseName(raw: string) {
  const trimmed = raw
    .trim()
    .replace(/\s*\((Tekrar|\d+)\)\s*$/i, "")
    .trim();
  const known = Object.keys(COURSE_META).find(
    (k) => k.toLowerCase() === trimmed.toLowerCase()
  );
  return known ?? trimmed;
}

async function main() {
  console.log("Seed başlıyor...");

  // Kurs kataloğunu students verisinden çıkar ve oluştur
  const allCourseNames = new Set<string>();
  for (const s of students) {
    for (const f of [s.course, s.completedModules]) {
      if (!f) continue;
      for (const part of f.split(",")) {
        const n = baseCourseName(part);
        if (n) allCourseNames.add(n);
      }
    }
  }
  const courseIdByName = new Map<string, string>();
  for (const name of allCourseNames) {
    const meta = COURSE_META[name] ?? { icon: "BookOpen", color: "#502e9f" };
    const course = await prisma.course.create({
      data: { name, icon: meta.icon, color: meta.color },
    });
    courseIdByName.set(name, course.id);
  }
  console.log(`${courseIdByName.size} kurs oluşturuldu.`);

  const groupNames = [...new Set(students.map((s) => s.groupName).filter((n): n is string => !!n))];
  const groupIdByName = new Map<string, string>();
  for (const name of groupNames) {
    const group = await prisma.group.create({ data: { name } });
    groupIdByName.set(name, group.id);
  }
  console.log(`${groupIdByName.size} grup oluşturuldu.`);

  for (const s of students) {
    const { installments, course, completedModules, groupName, ...rest } = s;
    const data = { ...rest, groupId: groupName ? groupIdByName.get(groupName) : undefined };
    const student = await prisma.student.create({ data });
    if (installments?.length) {
      await prisma.installment.createMany({
        data: installments.map((amount, i) => ({
          studentId: student.id,
          index: i + 1,
          amount,
          status: amount > 0 ? "Odendi" : "Bekliyor",
        })),
      });
    }

    let seq = 0;
    const baseTime = Date.now();
    const entries: { name: string; status: string }[] = [];
    if (completedModules) {
      for (const part of completedModules.split(",")) {
        const n = baseCourseName(part);
        if (n) entries.push({ name: n, status: "Tamamlandi" });
      }
    }
    if (course) {
      for (const part of course.split(",")) {
        const n = baseCourseName(part);
        if (n) entries.push({ name: n, status: "Aktif" });
      }
    }
    for (const e of entries) {
      const courseId = courseIdByName.get(e.name);
      if (!courseId) continue;
      await prisma.studentCourse.create({
        data: {
          studentId: student.id,
          courseId,
          status: e.status,
          createdAt: new Date(baseTime + seq * 60000),
        },
      });
      seq++;
    }
  }
  console.log(`${students.length} öğrenci eklendi.`);

  await prisma.scheduleSession.createMany({ data: scheduleSessions });
  console.log(`${scheduleSessions.length} program kaydı eklendi.`);

  await prisma.lead.createMany({ data: leads });
  console.log(`${leads.length} talep kaydı eklendi.`);

  console.log("Seed tamamlandı.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
