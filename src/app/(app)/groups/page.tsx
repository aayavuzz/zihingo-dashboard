import { ChevronDown, X } from "lucide-react";
import { prisma } from "@/lib/db";
import {
  Button,
  Card,
  EmptyState,
  PageHeader,
  SummaryButton,
  inputClass,
  labelClass,
} from "@/components/ui";
import {
  addStudentToGroup,
  createGroup,
  deleteGroup,
  removeStudentFromGroup,
  updateGroup,
} from "./actions";

export const dynamic = "force-dynamic";

const rowCols = "grid grid-cols-[1fr_120px_28px] items-center gap-3";

export default async function GroupsPage() {
  const [groups, allStudents] = await Promise.all([
    prisma.group.findMany({
      orderBy: { name: "asc" },
      include: { students: { orderBy: { name: "asc" } } },
    }),
    prisma.student.findMany({
      orderBy: { name: "asc" },
      include: { group: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Gruplar"
        description="Aynı gruptaki öğrenciler haftalık programda birlikte ders alır"
        action={
          <details className="relative">
            <summary className="list-none">
              <SummaryButton variant="primary">+ Grup Ekle</SummaryButton>
            </summary>
            <Card className="absolute right-0 mt-2 w-80 p-4 z-10">
              <form action={createGroup} className="space-y-3">
                <div>
                  <label className={labelClass}>Grup Adı *</label>
                  <input name="name" required className={inputClass} placeholder="Örn: Grup 08" />
                </div>
                <div>
                  <label className={labelClass}>Not</label>
                  <input name="note" className={inputClass} />
                </div>
                <Button variant="primary" className="w-full">
                  Kaydet
                </Button>
              </form>
            </Card>
          </details>
        }
      />

      <Card>
        {groups.length === 0 ? (
          <EmptyState text="Henüz grup eklenmedi." />
        ) : (
          <div>
            <div
              className={`${rowCols} px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wide`}
            >
              <span>Grup Adı</span>
              <span>Öğrenci Sayısı</span>
              <span />
            </div>
            {groups.map((g) => {
              const updateWithId = updateGroup.bind(null, g.id);
              const deleteWithId = deleteGroup.bind(null, g.id);
              const addStudentWithId = addStudentToGroup.bind(null, g.id);
              const memberIds = new Set(g.students.map((s) => s.id));

              return (
                <details key={g.id} className="group border-b border-slate-100 last:border-b-0">
                  <summary
                    className={`${rowCols} list-none cursor-pointer px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors`}
                  >
                    <span className="font-medium text-slate-800">{g.name}</span>
                    <span className="text-slate-500">{g.students.length} öğrenci</span>
                    <ChevronDown
                      size={16}
                      className="text-slate-400 transition-transform group-open:rotate-180 justify-self-end"
                    />
                  </summary>
                  <div className="px-4 pb-5 pt-3 bg-slate-50/60 border-t border-slate-100">
                    <div className="mb-5">
                      <div className="text-xs font-medium text-slate-600 mb-2">Üyeler</div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {g.students.length === 0 && (
                          <span className="text-xs text-slate-400">Henüz öğrenci eklenmedi.</span>
                        )}
                        {g.students.map((s) => {
                          const removeWithId = removeStudentFromGroup.bind(null, s.id);
                          return (
                            <div
                              key={s.id}
                              className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 ring-1 ring-brand-600/15"
                            >
                              <span>{s.name}</span>
                              <form action={removeWithId}>
                                <button
                                  type="submit"
                                  className="opacity-60 hover:opacity-100"
                                  title="Gruptan çıkar"
                                >
                                  <X size={12} />
                                </button>
                              </form>
                            </div>
                          );
                        })}
                      </div>
                      <form action={addStudentWithId} className="flex items-end gap-2 flex-wrap">
                        <div className="min-w-[220px]">
                          <label className={labelClass}>Öğrenci Ekle</label>
                          <select name="studentId" required className={inputClass} defaultValue="">
                            <option value="" disabled>
                              Seçiniz
                            </option>
                            {allStudents.map((s) => (
                              <option key={s.id} value={s.id} disabled={memberIds.has(s.id)}>
                                {s.name}
                                {s.group && s.group.id !== g.id ? ` (şu an: ${s.group.name})` : ""}
                                {memberIds.has(s.id) ? " (bu grupta)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button variant="secondary">Ekle</Button>
                      </form>
                    </div>

                    <form action={updateWithId} className="space-y-3 max-w-md">
                      <div>
                        <label className={labelClass}>Grup Adı *</label>
                        <input name="name" required defaultValue={g.name} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Not</label>
                        <input name="note" defaultValue={g.note ?? ""} className={inputClass} />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button variant="primary">Kaydet</Button>
                      </div>
                    </form>
                    <form action={deleteWithId} className="mt-3">
                      <Button variant="danger">Grubu Sil</Button>
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
