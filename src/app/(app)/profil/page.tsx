import { ChevronDown } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { Button, Card, inputClass, labelClass, PageHeader } from "@/components/ui";
import { updateOwnProfile, updateUserProfile } from "./actions";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  superadmin: "Süper Admin",
  admin: "Admin",
  teacher: "Öğretmen",
};

function Avatar({ name, photoUrl, size = 64 }: { name: string; photoUrl?: string | null; size?: number }) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover ring-1 ring-slate-200 shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size / 2.5 }}
      className="rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold shrink-0"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default async function ProfilPage() {
  const session = await getSession();
  if (!session) return null;

  const me = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!me) return null;

  const isSuperAdmin = session.role === "superadmin";
  const others = isSuperAdmin
    ? await prisma.user.findMany({
        where: { id: { not: me.id } },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <div>
      <PageHeader title="Profil" description="Kendi hesap bilgilerin" />

      <Card className="p-5 max-w-xl mb-8">
        <div className="flex items-center gap-4 mb-5">
          <Avatar name={me.name ?? me.email} photoUrl={me.photoUrl} />
          <div>
            <div className="font-semibold text-slate-800">{me.name ?? "İsimsiz"}</div>
            <div className="text-sm text-slate-500">{me.email}</div>
            <div className="text-xs text-slate-400 mt-0.5">{roleLabels[me.role] ?? me.role}</div>
          </div>
        </div>
        <form action={updateOwnProfile} className="space-y-3">
          <div>
            <label className={labelClass}>Ad Soyad</label>
            <input name="name" defaultValue={me.name ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Telefon</label>
            <input name="phone" defaultValue={me.phone ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fotoğraf</label>
            <input
              name="photo"
              type="file"
              accept="image/*"
              className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-700 hover:file:bg-brand-100`}
            />
          </div>
          <Button variant="primary">Kaydet</Button>
        </form>
      </Card>

      {isSuperAdmin && others.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Tüm Kullanıcılar ({others.length})
          </h2>
          <Card>
            {others.map((u) => {
              const updateWithId = updateUserProfile.bind(null, u.id);
              return (
                <details key={u.id} className="group border-b border-slate-100 last:border-b-0">
                  <summary className="list-none cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <Avatar name={u.name ?? u.email} photoUrl={u.photoUrl} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {u.name ?? u.email}
                      </div>
                      <div className="text-xs text-slate-400 truncate">{u.email}</div>
                    </div>
                    <span className="text-xs text-slate-400">{roleLabels[u.role] ?? u.role}</span>
                    <ChevronDown
                      size={16}
                      className="text-slate-400 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div className="px-4 pb-4 pt-1 bg-slate-50/60 border-t border-slate-100">
                    <form action={updateWithId} className="space-y-3 max-w-md pt-3">
                      <div>
                        <label className={labelClass}>Ad Soyad</label>
                        <input name="name" defaultValue={u.name ?? ""} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Telefon</label>
                        <input name="phone" defaultValue={u.phone ?? ""} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Fotoğraf</label>
                        <input
                          name="photo"
                          type="file"
                          accept="image/*"
                          className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-700 hover:file:bg-brand-100`}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Rol</label>
                        <select name="role" defaultValue={u.role} className={inputClass}>
                          <option value="teacher">Öğretmen</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Süper Admin</option>
                        </select>
                      </div>
                      <Button variant="primary">Kaydet</Button>
                    </form>
                  </div>
                </details>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}
