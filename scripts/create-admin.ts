import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error("Kullanım: npx tsx scripts/create-admin.ts <email> <şifre>");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash },
    create: { email: email.toLowerCase(), passwordHash },
  });

  console.log(`Kullanıcı hazır: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
