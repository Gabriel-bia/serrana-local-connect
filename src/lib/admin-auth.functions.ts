import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const { readAdminSession } = await import("./admin-auth.server");
  const admin = await readAdminSession();

  return {
    authenticated: admin.authenticated,
    role: admin.role,
    loggedAt: admin.loggedAt,
  };
});

export const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const adminPassword = process.env.SERRANA_ADMIN_PASSWORD ?? "Gbcgarcia12";

    if (data.password !== adminPassword) {
      throw new Error("Senha incorreta.");
    }

    const { readAdminSession } = await import("./admin-auth.server");
    const admin = await readAdminSession();
    await admin.session.update({
      token: crypto.randomUUID(),
      role: "admin",
      loggedAt: new Date().toISOString(),
    });

    return { authenticated: true, role: "admin" as const, redirectTo: "/dashboard" as const };
  });

export const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { clearAdminSession } = await import("./admin-auth.server");
  await clearAdminSession();
  return { authenticated: false };
});