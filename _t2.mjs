import { prisma } from "./src/lib/db.ts";
import { updateLead } from "./src/app/(app)/takip-listesi/actions.ts";

const lead = await prisma.lead.findFirst({ where: { note: { not: null } } });
console.log("Kayıt:", lead.contactName);
console.log("Eski 'note' sütunu (yedek):", lead.note ? `DOLU (${lead.note.length} kr)` : "BOŞ");
console.log("LeadNote sayısı:", await prisma.leadNote.count({ where: { leadId: lead.id } }));

// Kayıt güncellemesi notları etkiliyor mu?
const fd = new FormData();
fd.set("contactName", lead.contactName ?? "");
fd.set("status", lead.status);
fd.set("type", lead.type);
try { await updateLead(lead.id, fd); } catch (e) {
  if (!String(e?.message ?? e).includes("NEXT_")) throw e; // revalidatePath/redirect sinyali
}

const after = await prisma.lead.findUnique({ where: { id: lead.id } });
console.log("\n--- Güncelleme sonrası ---");
console.log("Eski 'note' sütunu:", after.note ? `KORUNDU (${after.note.length} kr)` : "SİLİNDİ!");
console.log("LeadNote sayısı:", await prisma.leadNote.count({ where: { leadId: lead.id } }));
console.log("Toplam LeadNote (tüm kayıtlar):", await prisma.leadNote.count());
await prisma.$disconnect();
