import { createFileRoute, redirect } from "@tanstack/react-router";
import { isAuthenticated } from "../utils/auth";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: "/login",
        // Opsional: Bawa informasi halaman asal jika kamu ingin redirect balik setelah login sukses
        // search: { redirect: '/dashboard' },
      });
    }
  },
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="p-8 min-h-screen bg-bg-default text-text-primary">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="bg-bg-paper border border-divider p-6 rounded-lg shadow-sm">
        <p>
          Selamat datang! Anda berhasil masuk karena memiliki cookie yang valid.
        </p>
      </div>
    </div>
  );
}
