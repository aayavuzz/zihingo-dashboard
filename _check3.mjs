import { prisma } from "./src/lib/db.ts";
const lead = await prisma.lead.findUnique({ where: { id: "cmwhy9if60001tjitzcpnz741" } });
console.log(JSON.stringify(lead, null, 2));
await prisma.$disconnect();
