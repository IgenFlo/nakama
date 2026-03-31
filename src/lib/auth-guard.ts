import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Role } from "@/generated/prisma/client";

export type AuthSession = {
  user: { id: string; name?: string | null; email?: string | null; role: Role };
};

type GuardOk<T> = { session: T; error: null };
type GuardErr = { session: null; error: NextResponse };
type GuardResult<T> = GuardOk<T> | GuardErr;

// ─── Session dédupliquée par requête (React.cache) ──────────────────────────
export const getSession = cache(
  async (): Promise<AuthSession | null> => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return null;
    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as unknown as { role: Role }).role,
      },
    };
  },
);

// ─── Pour les Route Handlers (retourne un tuple) ──────────────────────────────

export async function getAuthSession(): Promise<GuardResult<AuthSession>> {
  const session = await getSession();
  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }),
    };
  }
  return { session, error: null };
}

export async function getAdminSession(): Promise<GuardResult<AuthSession>> {
  const result = await getAuthSession();
  if (result.error) return result;
  if (result.session.user.role !== "ADMIN") {
    return {
      session: null,
      error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }),
    };
  }
  return result;
}

// ─── Pour les Server Components / Server Actions (lance une erreur) ───────────

export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

export async function requireAdmin(): Promise<AuthSession> {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}
