import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMatches, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getAdminSession, loginAdmin, logoutAdmin } from "@/lib/admin-auth.functions";

const ADMIN_SESSION_QUERY_KEY = ["admin-session"] as const;
type AdminRoutePath = "/admin" | "/dashboard" | "/admin/whatsapp";

export function AdminAuthGate({
  children,
  redirectToAfterLogin,
}: {
  children: ReactNode;
  redirectToAfterLogin: AdminRoutePath;
}) {
  const navigate = useNavigate();
  const matches = useMatches();
  const currentRouteId = matches.at(-1)?.routeId;
  const queryClient = useQueryClient();
  const fetchSession = useServerFn(getAdminSession);
  const signIn = useServerFn(loginAdmin);
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ADMIN_SESSION_QUERY_KEY,
    queryFn: () => fetchSession(),
    retry: false,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto grid flex-1 place-items-center px-4 py-16 text-muted-foreground">
          Verificando sessão…
        </main>
        <Footer />
      </div>
    );
  }

  if (!data?.authenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-16 flex-1 grid place-items-center">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setSubmitting(true);
              try {
                await signIn({ data: { password: pass } });
                queryClient.setQueryData(ADMIN_SESSION_QUERY_KEY, {
                  authenticated: true,
                  role: "admin",
                  loggedAt: new Date().toISOString(),
                });
                setPass("");
                if (currentRouteId !== redirectToAfterLogin) {
                  await navigate({ to: redirectToAfterLogin, replace: true });
                }
              } catch (err) {
                setError(err instanceof Error ? err.message : "Senha incorreta.");
              } finally {
                setSubmitting(false);
              }
            }}
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
          >
            <h1 className="text-2xl font-bold">Área administrativa</h1>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Senha"
              autoComplete="current-password"
              className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            <button
              disabled={submitting}
              className="mt-3 w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}

export function useAdminLogout(redirectTo: AdminRoutePath = "/admin") {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const signOut = useServerFn(logoutAdmin);

  return async () => {
    await signOut();
    queryClient.setQueryData(ADMIN_SESSION_QUERY_KEY, { authenticated: false, role: null, loggedAt: null });
    queryClient.removeQueries({ queryKey: ADMIN_SESSION_QUERY_KEY });
    await navigate({ to: redirectTo, replace: true });
  };
}