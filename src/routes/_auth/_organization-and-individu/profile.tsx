import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/profile",
)({
  component: ProfileLayout,
});

function ProfileLayout() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pt-4 max-w-4xl w-full mx-auto">
      {/* HEADER GLOBAL PROFIL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Pengaturan Akun
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Kelola informasi identitas personal dan program afiliasi Anda.
          </p>
        </div>
        <Link
          to="/portal"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-text-secondary bg-divider/20 hover:bg-divider/40 transition-colors w-fit"
        >
          &larr; Kembali ke Portal
        </Link>
      </div>

      {/* NAVIGASI TAB */}
      <div className="flex items-center gap-6 border-b border-divider">
        <Link
          to="/profile"
          activeOptions={{ exact: true }}
          activeProps={{ className: "border-primary-main text-primary-main" }}
          inactiveProps={{
            className:
              "border-transparent text-text-secondary hover:text-text-primary",
          }}
          className="py-3 text-sm font-bold border-b-2 transition-all"
        >
          Informasi Profil
        </Link>
        <Link
          to="/profile/referral"
          activeProps={{ className: "border-primary-main text-primary-main" }}
          inactiveProps={{
            className:
              "border-transparent text-text-secondary hover:text-text-primary",
          }}
          className="py-3 text-sm font-bold border-b-2 transition-all"
        >
          Referral & Afiliasi
        </Link>
      </div>

      {/* AREA KONTEN HALAMAN (Index Profil atau Referral akan muncul di sini) */}
      <Outlet />
    </div>
  );
}
