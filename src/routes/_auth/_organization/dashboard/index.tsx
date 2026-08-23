import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/_organization/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  return (
    <div>
      <h2>Overview Dashboard</h2>
      <p>Selamat datang di area kerja Anda.</p>

      <div
        style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#eee" }}
      >
        <h4>Statistik Singkat</h4>
        <p>Status Akun: </p>
        <p>Email: </p>
      </div>
    </div>
  );
}
