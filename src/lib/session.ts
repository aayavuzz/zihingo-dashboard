import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

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
  };
}

// Server action'larda "son düzenleyen" alanını doldurmak için.
export async function getActorEmail() {
  const session = await getSession();
  return session?.email ?? null;
}
