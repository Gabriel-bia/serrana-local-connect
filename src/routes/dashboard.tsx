import { createFileRoute } from "@tanstack/react-router";
import { AdminAuthGate } from "@/components/AdminAuthGate";
import { AdminDashboardContent } from "@/routes/admin";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Serrana Express" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AdminAuthGate redirectToAfterLogin="/dashboard">
      <AdminDashboardContent />
    </AdminAuthGate>
  );
}