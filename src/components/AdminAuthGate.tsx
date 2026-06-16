import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

type GateState = "loading" | "unauth" | "noadmin" | "ok";

// Prop kept for backward compatibility with existing call sites.
type Props = { children: ReactNode; redirectToAfterLogin?: string };

export function AdminAuthGate({ children }: Props) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<GateState>("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function check() {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      const user = !userErr ? userRes.user : null;
      if (!user) {
        if (mounted) {
          setEmail(null);
          setStatus("unauth");
        }
        return;
      }
      if (mounted) setEmail(user.email ?? null);
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (mounted) setStatus(role ? "ok" : "noadmin");
    }

    check();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        check();
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (status === "unauth") {
      navigate({
        to: "/auth",
        search: { redirect: window.location.pathname },
        replace: true,
      });
    }
  }, [status, navigate]);

  if (status === "loading" || status === "unauth") {
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

  if (status === "noadmin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto flex-1 grid place-items-center px-4 py-16">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-[var(--shadow-card)]">
            <h1 className="text-2xl font-bold">Acesso negado</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              A conta <b>{email}</b> não é administradora. Solicite ao administrador principal
              que conceda permissão.
            </p>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/auth", replace: true });
              }}
              className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Sair
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}

export function useAdminLogout(redirectTo: string = "/auth") {
  const navigate = useNavigate();
  return async () => {
    await supabase.auth.signOut();
    await navigate({ to: redirectTo, replace: true });
  };
}
