import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/register/__root")({
  component: RegisterLayout,
});

function RegisterLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-default">
      {/* Header */}
      <header className="bg-bg-paper border-b border-divider px-8 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="text-xl font-bold text-primary-main hover:opacity-80 transition"
          >
            @psych-web
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition"
          >
            Sudah punya akun? Masuk
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-bg-paper border-t border-divider px-8 py-6">
        <div className="max-w-5xl mx-auto text-center text-sm text-text-secondary">
          <p>&copy; 2024 PsychAPI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
