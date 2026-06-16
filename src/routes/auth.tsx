import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const search = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: zodValidator(search),
  head: () => ({ meta: [{ title: "Entrar — Serrana Express" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: (redirect as string) || "/admin", replace: true });
    });
  }, [navigate, redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
      }
      toast.success("Tudo certo! Entrando…");
      navigate({ to: (redirect as string) || "/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao entrar.");
    } finally {
      setBusy(false);
    }
  }

  async function googleSignIn() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/admin",
      });
      if (result.error) {
        toast.error(result.error.message || "Falha no login com Google.");
        return;
      }
      if (result.redirected) return;
      navigate({ to: (redirect as string) || "/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no login com Google.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto flex-1 grid place-items-center px-4 py-16">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h1 className="text-2xl font-bold">
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Acesse o painel administrativo."
              : "A primeira conta criada vira administrador automaticamente."}
          </p>

          <form onSubmit={submit} className="mt-5 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              autoComplete="email"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              disabled={busy}
              className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Aguarde…" : mode === "signin" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={googleSignIn}
            disabled={busy}
            className="w-full rounded-lg border border-border bg-background py-2.5 text-sm font-semibold hover:bg-muted disabled:opacity-60"
          >
            Entrar com Google
          </button>

          <p className="mt-4 text-center text-sm">
            {mode === "signin" ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold text-primary hover:underline"
            >
              {mode === "signin" ? "Criar conta" : "Entrar"}
            </button>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
