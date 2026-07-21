import { Link } from "@tanstack/react-router";
import { useAuth } from "../../hooks/useAuth";

export function Sidebar() {
  const { user } = useAuth();

  // Jika user belum termuat, jangan render apa-apa (atau render skeleton)
  if (!user) return null;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">@psych-web</h1>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {/* Menu Umum (Bisa diakses Individu & Organisasi) */}
        <div className="mb-6">
          <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Menu Utama
          </p>
          <Link
            to="/dashboard"
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 [&.active]:bg-blue-100 [&.active]:text-blue-700"
          >
            Overview
          </Link>
          <Link
            to="/dashboard/tests"
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 [&.active]:bg-blue-100 [&.active]:text-blue-700"
          >
            Psikotes
          </Link>
          <Link
            to="/dashboard/billing"
            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 [&.active]:bg-blue-100 [&.active]:text-blue-700"
          >
            Langganan & Tagihan
          </Link>
        </div>

        {/* Menu Khusus Organisasi */}
        {user.accountType === "ORGANIZATION" && (
          <div className="mb-6">
            <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Organisasi
            </p>
            <Link
              to="/dashboard/members"
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 [&.active]:bg-blue-100 [&.active]:text-blue-700"
            >
              Manajemen Anggota
            </Link>
          </div>
        )}

        {/* Menu Khusus Super Admin */}
        {user.roles?.includes("ADMIN") && (
          <div>
            <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Sistem
            </p>
            <Link
              to="/dashboard/admin"
              className="block px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 [&.active]:bg-red-100 [&.active]:text-red-700"
            >
              Super Admin Panel
            </Link>
          </div>
        )}
      </nav>

      {/* Footer Sidebar (Opsional) */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">&copy; 2026 PsyCorp</p>
      </div>
    </aside>
  );
}
