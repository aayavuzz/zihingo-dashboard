import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

async function main() {
  const [, , email, password, role = "admin", ...nameParts] = process.argv;
  const name = nameParts.join(" ") || undefined;
  if (!email || !password) {
    console.error(
      "Kullanım: npx tsx scripts/create-admin.ts <email> <şifre> [superadmin|admin|teacher] [isim]"
    );
    process.exit(1);
  }
  if (role !== "superadmin" && role !== "admin" && role !== "teacher") {
    console.error('Rol "superadmin", "admin" veya "teacher" olmalı');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, role, ...(name ? { name } : {}) },
    create: { email: email.toLowerCase(), passwordHash, role, name },
  });

  console.log(`Kullanıcı hazır: ${user.email} (${user.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
