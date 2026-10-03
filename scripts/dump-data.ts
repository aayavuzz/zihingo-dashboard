// Mevcut DATABASE_URL'deki veritabanının tüm verisini JSON'a döker.
// Kullanım: npx tsx scripts/dump-data.ts <çıktı-dosyası.json>
import { prisma } from "../src/lib/db";
import { writeFileSync } from "node:fs";

async function main() {
  const outPath = process.argv[2];
  if (!outPath) {
    console.error("Kullanım: npx tsx scripts/dump-data.ts <çıktı-dosyası.json>");
    process.exit(1);
  }

  const data = {
    groups: await prisma.group.findMany(),
    courses: await prisma.course.findMany(),
    teachers: await prisma.teacher.findMany(),
    students: await prisma.student.findMany(),
    studentCourses: await prisma.studentCourse.findMany(),
    installments: await prisma.installment.findMany(),
    scheduleSessions: await prisma.scheduleSession.findMany(),
    lessons: await prisma.lesson.findMany(),
    leads: await prisma.lead.findMany(),
  };

  writeFileSync(outPath, JSON.stringify(data, null, 2));

  for (const [key, rows] of Object.entries(data)) {
    console.log(`${key}: ${rows.length}`);
  }
  console.log(`\nYazıldı: ${outPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
