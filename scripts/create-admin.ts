import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

async function main() {
  const [, , email, password, role = "admin"] = process.argv;
  if (!email || !password) {
    console.error("Kullanım: npx tsx scripts/create-admin.ts <email> <şifre> [admin|teacher]");
    process.exit(1);
  }
  if (role !== "admin" && role !== "teacher") {
    console.error('Rol "admin" veya "teacher" olmalı');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, role },
    create: { email: email.toLowerCase(), passwordHash, role },
  });

  console.log(`Kullanıcı hazır: ${user.email} (${user.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
