import { prisma } from "@/lib/db";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const teachers = await prisma.teacher.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader
        title="Profil"
        description="Okulumuzdaki öğretmenler ve iletişim bilgileri"
      />

      {teachers.length === 0 ? (
        <Card>
          <EmptyState text="Henüz öğretmen eklenmedi." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((t) => (
            <Card key={t.id} className="p-5 flex items-center gap-4">
              {t.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.photoUrl}
                  alt={t.name}
                  className="w-16 h-16 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
                  {t.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-semibold text-slate-800 truncate">{t.name}</div>
                <div className="text-sm text-slate-500 mt-0.5">{t.phone ?? "Telefon yok"}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
