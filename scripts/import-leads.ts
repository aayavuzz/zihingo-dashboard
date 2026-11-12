import { readFileSync } from "node:fs";
import { prisma } from "../src/lib/db";

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (c === "\r") {
        // yoksay
      } else field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const STATUS_MAP: Record<string, string> = {
  "": "Yeni",
  "Ulaşılamadı": "Ulasilamadi",
  "Takip Araması": "TakipAramasi",
  "Olumlu": "Olumlu",
  "Olumsuz": "Olumsuz",
  "Kapandı": "Kapandi",
  "Havuz": "Havuz",
  "Dönüş bekleniyor": "DonusBekleniyor",
  "Dönüş bekliyor": "DonusBekleniyor",
  "Ofise davet": "OfiseDavet",
};

function num(v: string) {
  const n = parseInt(v.trim(), 10);
  return Number.isFinite(n) ? n : undefined;
}

function clean(v: string | undefined) {
  const t = (v ?? "").trim();
  return t ? t : undefined;
}

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error("Kullanım: npx tsx scripts/import-leads.ts <csv-dosyası>");
    process.exit(1);
  }

  const content = readFileSync(path, "utf-8");
  const rows = parseCSV(content);
  const data = rows.slice(1).filter((r) => r.some((c) => c && c.trim()));

  const existing = await prisma.lead.findMany({ select: { contactName: true, phone: true } });
  const existingKeys = new Set(
    existing.map((e) => `${(e.contactName ?? "").trim()}|${(e.phone ?? "").trim()}`)
  );

  let created = 0;
  let skipped = 0;

  for (const r of data) {
    const contactName = clean(r[0]);
    const phone = clean(r[1]);
    const key = `${contactName ?? ""}|${phone ?? ""}`;

    if (existingKeys.has(key)) {
      skipped++;
      continue;
    }

    const statusRaw = (r[2] ?? "").trim();
    const status = STATUS_MAP[statusRaw] ?? "Yeni";

    await prisma.lead.create({
      data: {
        type: "Normal",
        contactName,
        phone,
        status,
        studentName: clean(r[3]),
        age: num(r[4] ?? ""),
        grade: clean(r[5]),
        school: clean(r[6]),
        location: clean(r[7]),
        firstContactDate: clean(r[8]),
        lastContactDate: clean(r[9]),
        appointmentDate: clean(r[10]),
        appointmentTime: clean(r[11]),
      },
    });
    existingKeys.add(key);
    created++;
  }

  console.log(`Oluşturulan: ${created}, Atlanan (zaten vardı): ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
