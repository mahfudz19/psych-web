import { Link, Outlet } from "@tanstack/react-router";
import DarkMode from "../../../../components/layout/Topbar/DarkMode";
import LanguageSwitcher from "../../../../components/layout/Topbar/LanguageSwitcher";
import ProfileDropdown from "../../../../components/layout/Topbar/ProfileDropdown";
import { useAuth } from "../../../../hooks/useAuth";

function PortalHeader() {
  const { user } = useAuth();

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-default text-text-secondary">
        Memuat layout...
      </div>
    );

  return (
    <header className="h-16 bg-bg-paper border-b border-divider flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shadow-sm transition-colors duration-200">
      {/* BAGIAN KIRI: Logo Aplikasi */}
      <div className="flex items-center">
        <Link
          to="/portal"
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-main/20 rounded-xl transition-all"
          aria-label="Beranda Portal"
        >
          <span className="text-xl font-extrabold text-primary-main tracking-tight">
            @psych-web
          </span>
        </Link>
      </div>

      {/* BAGIAN KANAN: Aksi Global & Profil */}
      <div className="flex items-center space-x-2 lg:space-x-4">
        <LanguageSwitcher />
        <DarkMode />
        <div className="h-6 w-px bg-divider mx-1 hidden sm:block"></div>
        <ProfileDropdown />
      </div>
    </header>
  );
}

export default function PortalLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-default text-text-primary transition-colors duration-200">
      <PortalHeader />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col">
        <Outlet />
      </main>

      <footer className="py-6 text-center shrink-0">
        <p className="text-xs font-medium text-text-disabled tracking-wide">
          &copy; {new Date().getFullYear()} PsyCorp. Dilindungi Hak Cipta.
        </p>
      </footer>
    </div>
  );
}
