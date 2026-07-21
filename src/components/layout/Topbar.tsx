import { useAuth } from "../../hooks/useAuth";

export function Topbar() {
  const { user, logout, isLoggingOut } = useAuth();

  if (!user) return null;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Bagian Kiri: Breadcrumbs atau Judul Halaman (Opsional) */}
      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-500">
          Selamat datang kembali,{" "}
          <strong className="text-gray-900">{user.fullName}</strong>
        </span>
      </div>

      {/* Bagian Kanan: Profil & Aksi */}
      <div className="flex items-center space-x-4">
        {/* Badge Tipe Akun */}
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full 
          ${user.accountType === "ORGANIZATION" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}
        `}
        >
          {user.accountType}
        </span>

        {/* Tombol Logout */}
        <button
          onClick={logout}
          disabled={isLoggingOut}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors"
        >
          {isLoggingOut ? "Keluar..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
