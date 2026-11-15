import { cookies } from "next/headers";
import { SESSION_COOKIE, createSessionToken, verifySessionToken } from "./auth";

type SessionUser = {
  id: string;
  role: string;
  email: string;
  name?: string | null;
  photoUrl?: string | null;
};

// Giriş sırasında ve profil güncellendiğinde çerezi (yeniden) yazmak için ortak yol.
export async function issueSession(user: SessionUser) {
  const token = await createSessionToken(user.id, user.role, user.email, user.name, user.photoUrl);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  return {
    userId: payload.sub as string,
    role: (payload.role as string) ?? "admin",
    email: payload.email as string | undefined,
    name: payload.name as string | undefined,
    photoUrl: payload.photoUrl as string | undefined,
  };
}

// Server action'larda "son düzenleyen" alanını doldurmak için.
export async function getActorEmail() {
  const session = await getSession();
  return session?.email ?? null;
}
