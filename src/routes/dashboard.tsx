import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { AdminAuthGate } from "@/components/AdminAuthGate";

const AdminDashboardContent = lazy(() =>
  import("@/routes/admin").then((module) => ({ default: module.AdminDashboardContent })),
);

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Serrana Express" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AdminAuthGate redirectToAfterLogin="/dashboard">
      <Suspense fallback={<div className="min-h-screen grid place-items-center text-muted-foreground">Carregando Dashboard…</div>}>
        <AdminDashboardContent />
      </Suspense>
    </AdminAuthGate>
  );
}