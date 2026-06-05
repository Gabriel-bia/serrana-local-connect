import { clearSession, useSession } from "@tanstack/react-start/server";

export type AdminSessionData = {
  token: string;
  role: "admin";
  loggedAt: string;
};

export function getAdminSessionConfig() {
  return {
    password:
      process.env.ADMIN_SESSION_SECRET ??
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      "serrana-express-admin-session-secret-fallback-2026",
    name: "serrana_admin_session",
    maxAge: 60 * 60 * 24 * 30,
    cookie: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  };
}

export function isValidAdminSession(data: Partial<AdminSessionData> | undefined): data is AdminSessionData {
  return data?.role === "admin" && typeof data.token === "string" && data.token.length >= 16;
}

export async function readAdminSession() {
  const session = await useSession<AdminSessionData>(getAdminSessionConfig());
  const authenticated = isValidAdminSession(session.data);

  return {
    session,
    authenticated,
    role: authenticated ? session.data.role : null,
    loggedAt: authenticated ? session.data.loggedAt : null,
  };
}

export async function requireAdminSession() {
  const admin = await readAdminSession();
  if (!admin.authenticated) {
    throw new Error("Acesso administrativo obrigatório.");
  }
  return admin;
}

export async function clearAdminSession() {
  await clearSession(getAdminSessionConfig());
}