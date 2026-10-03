import { Card, inputClass, labelClass } from "@/components/ui";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="flex flex-col items-center gap-2 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="ZihinGO" className="w-12 h-12" />
          <div className="text-center">
            <div className="text-sm font-bold text-slate-900 leading-tight">ZihinGO</div>
            <div className="text-[11px] text-slate-400 leading-tight">Yönetim Paneli</div>
          </div>
        </div>

        <form action={login} className="space-y-3">
          <div>
            <label className={labelClass}>E-posta</label>
            <input
              name="email"
              type="email"
              required
              autoFocus
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Şifre</label>
            <input name="password" type="password" required className={inputClass} />
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 rounded-md px-3 py-2">
              E-posta veya şifre hatalı.
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-brand-600 text-white text-sm font-medium py-2.5 hover:bg-brand-700 transition-colors"
          >
            Giriş Yap
          </button>
        </form>
      </Card>
    </div>
  );
}
