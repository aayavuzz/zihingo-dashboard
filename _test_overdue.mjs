import { prisma } from "./src/lib/db.ts";

const now = new Date();
const turkeyNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
const past = new Date(turkeyNow.getTime() - 10 * 60 * 1000); // 10 dakika önce (Türkiye saatiyle)

const callDate = past.toISOString().slice(0, 10);
const callTime = past.toISOString().slice(11, 16);

const lead = await prisma.lead.create({
  data: {
    type: "Normal",
    contactName: "Test Geçmiş Arama Kişisi",
    status: "Aranacak",
    callDate,
    callTime,
  },
});
console.log("Created overdue lead:", lead.id, "callDate:", callDate, "callTime:", callTime);
await prisma.$disconnect();
