import { ChevronDown } from "lucide-react";
import { prisma } from "@/lib/db";
import {
  Badge,
  badgeLabels,
  Card,
  EmptyState,
  PageHeader,
  SummaryButton,
  Button,
  inputClass,
  labelClass,
} from "@/components/ui";
import { createLead, deleteLead, updateLead } from "./actions";

export const dynamic = "force-dynamic";

const OPEN_STATUSES = ["Yeni", "TakipAramasi", "Havuz", "OfiseDavet", "DonusBekleniyor", "Ulasilamadi"];
const CLOSED_STATUSES = ["Olumlu", "Olumsuz", "Kapandi"];

const STATUS_OPTIONS = [
  "Yeni",
  "TakipAramasi",
  "OfiseDavet",
  "DonusBekleniyor",
  "Havuz",
  "Ulasilamadi",
  "Olumlu",
  "Olumsuz",
  "Kapandi",
];

// Durum | Veli/Ad | Telefon | Öğrenci | Temas | Not | ok
const rowCols =
  "grid grid-cols-[132px_minmax(130px,1fr)_120px_minmax(110px,0.9fr)_100px_minmax(140px,1.4fr)_24px] items-center gap-3";

function daysSince(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function TakipListesiPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const { tab, q } = await searchParams;
  const activeTab = tab ?? "acik";

  const leads = await prisma.lead.findMany({
    where: {
      OR: q
        ? [
            { contactName: { contains: q } },
            { studentName: { contains: q } },
            { phone: { contains: q } },
          ]
        : undefined,
    },
    orderBy: { updatedAt: "desc" },
  });

  const filtered = leads.filter((l) => {
    if (activeTab === "kapanan") return CLOSED_STATUSES.includes(l.status);
    if (activeTab === "tumu") return true;
    return OPEN_STATUSES.includes(l.status);
  });

  const tabs = [
    { key: "acik", label: "Açık", count: leads.filter((l) => OPEN_STATUSES.includes(l.status)).length },
    { key: "kapanan", label: "Kapanan", count: leads.filter((l) => CLOSED_STATUSES.includes(l.status)).length },
    { key: "tumu", label: "Tümü", count: leads.length },
  ];

  return (
    <div>
      <PageHeader
        title="Takip Listesi"
        description={`${filtered.length} kayıt listeleniyor — bir satıra tıklayarak düzenle`}
        action={
          <details className="relative">
            <summary className="list-none">
              <SummaryButton variant="primary">+ Talep Ekle</SummaryButton>
            </summary>
            <Card className="absolute right-0 mt-2 w-96 p-4 z-10">
              <form action={createLead} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Veli / İletişim Adı</label>
                    <input name="contactName" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Telefon</label>
                    <input name="phone" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Öğrenci</label>
                    <input name="studentName" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Yaş</label>
                    <input name="age" type="number" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Sınıf</label>
                    <input name="grade" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Okul</label>
                    <input name="school" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Yaşadığı Yer</label>
                    <input name="location" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Durum</label>
                  <select name="status" className={inputClass} defaultValue="Yeni">
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {badgeLabels[s] ?? s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>İlk Temas Tarihi</label>
                    <input name="firstContactDate" placeholder="gg.aa.yyyy" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Randevu Tarihi</label>
                    <input name="appointmentDate" placeholder="gg.aa.yyyy" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Not</label>
                  <input name="note" className={inputClass} />
                </div>
                <Button variant="primary" className="w-full">
                  Ekle
                </Button>
              </form>
            </Card>
          </details>
        }
      />

      <div className="flex items-center gap-4 mb-4">
        <div className="flex gap-1.5">
          {tabs.map((t) => (
            <a
              key={t.key}
              href={`/takip-listesi?tab=${t.key}`}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                activeTab === t.key
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label} <span className="opacity-70">({t.count})</span>
            </a>
          ))}
        </div>
        <form className="flex-1">
          <input type="hidden" name="tab" value={activeTab} />
          <input
            name="q"
            defaultValue={q}
            placeholder="İsim, öğrenci veya telefonla ara..."
            className={inputClass + " max-w-xs"}
          />
        </form>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState text="Kayıt bulunamadı." />
        ) : (
          <div>
            <div
              className={`${rowCols} px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wide`}
            >
              <span>Durum</span>
              <span>Veli / Ad</span>
              <span>Telefon</span>
              <span>Öğrenci</span>
              <span>Temas</span>
              <span>Not</span>
              <span />
            </div>

            {filtered.map((l) => {
              const updateLeadWithId = updateLead.bind(null, l.id);
              const deleteLeadWithId = deleteLead.bind(null, l.id);
              const contactDate = l.lastContactDate ?? l.firstContactDate;
              const stale =
                OPEN_STATUSES.includes(l.status) && contactDate
                  ? daysSince(
                      contactDate.split(".").length === 3
                        ? contactDate.split(".").reverse().join("-")
                        : contactDate
                    )
                  : null;

              return (
                <details key={l.id} className="group border-b border-slate-100 last:border-b-0">
                  <summary
                    className={`${rowCols} list-none cursor-pointer px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors`}
                  >
                    <span>
                      <Badge value={l.status} />
                    </span>
                    <span className="font-medium text-slate-800 truncate">
                      {l.contactName ?? "—"}
                    </span>
                    <span className="text-slate-500 truncate">{l.phone ?? "—"}</span>
                    <span className="text-slate-600 truncate">{l.studentName ?? "—"}</span>
                    <span className="text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
                      {contactDate ?? "—"}
                      {stale !== null && stale > 14 && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"
                          title={`${stale} gündür güncellenmedi`}
                        />
                      )}
                    </span>
                    <span className="text-slate-500 truncate" title={l.note ?? ""}>
                      {l.note ?? "—"}
                    </span>
                    <ChevronDown
                      size={16}
                      className="text-slate-400 transition-transform group-open:rotate-180 justify-self-end"
                    />
                  </summary>

                  <div className="px-4 pb-5 pt-3 bg-slate-50/60 border-t border-slate-100">
                    <form action={updateLeadWithId} className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className={labelClass}>Veli / İletişim Adı</label>
                          <input
                            name="contactName"
                            defaultValue={l.contactName ?? ""}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Telefon</label>
                          <input name="phone" defaultValue={l.phone ?? ""} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Durum</label>
                          <select name="status" className={inputClass} defaultValue={l.status}>
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {badgeLabels[s] ?? s}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Öğrenci</label>
                          <input
                            name="studentName"
                            defaultValue={l.studentName ?? ""}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Yaş</label>
                          <input
                            name="age"
                            type="number"
                            defaultValue={l.age ?? ""}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Sınıf</label>
                          <input name="grade" defaultValue={l.grade ?? ""} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Okul</label>
                          <input name="school" defaultValue={l.school ?? ""} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Yaşadığı Yer</label>
                          <input
                            name="location"
                            defaultValue={l.location ?? ""}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>İlk Temas Tarihi</label>
                          <input
                            name="firstContactDate"
                            defaultValue={l.firstContactDate ?? ""}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Son Temas Tarihi</label>
                          <input
                            name="lastContactDate"
                            defaultValue={l.lastContactDate ?? ""}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Randevu Tarihi</label>
                          <input
                            name="appointmentDate"
                            defaultValue={l.appointmentDate ?? ""}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Randevu Saati</label>
                          <input
                            name="appointmentTime"
                            defaultValue={l.appointmentTime ?? ""}
                            className={inputClass}
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-4">
                          <label className={labelClass}>Not</label>
                          <input name="note" defaultValue={l.note ?? ""} className={inputClass} />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button variant="primary">Kaydet</Button>
                      </div>
                    </form>
                    <form action={deleteLeadWithId} className="mt-3">
                      <button className="text-xs text-rose-500 hover:underline">Sil</button>
                    </form>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
