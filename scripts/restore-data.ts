// dump-data.ts ile alınan JSON yedeği, mevcut DATABASE_URL'deki (hedef)
// veritabanına foreign-key sırasına uyarak geri yükler.
// Kullanım: npx tsx scripts/restore-data.ts <yedek-dosyası.json>
import { prisma } from "../src/lib/db";
import { readFileSync } from "node:fs";

async function main() {
  const inPath = process.argv[2];
  if (!inPath) {
    console.error("Kullanım: npx tsx scripts/restore-data.ts <yedek-dosyası.json>");
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(inPath, "utf-8"));

  if (data.groups?.length) await prisma.group.createMany({ data: data.groups });
  if (data.courses?.length) await prisma.course.createMany({ data: data.courses });
  if (data.teachers?.length) await prisma.teacher.createMany({ data: data.teachers });
  if (data.students?.length) await prisma.student.createMany({ data: data.students });
  if (data.studentCourses?.length)
    await prisma.studentCourse.createMany({ data: data.studentCourses });
  if (data.installments?.length) await prisma.installment.createMany({ data: data.installments });
  if (data.scheduleSessions?.length)
    await prisma.scheduleSession.createMany({ data: data.scheduleSessions });
  if (data.lessons?.length) await prisma.lesson.createMany({ data: data.lessons });
  if (data.leads?.length) await prisma.lead.createMany({ data: data.leads });

  console.log("Geri yükleme tamamlandı:");
  for (const key of Object.keys(data)) {
    console.log(`${key}: ${data[key].length}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
