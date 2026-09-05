import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import Tabs from "../../../components/ui/Tabs";
import Tab from "../../../components/ui/Tabs/Tab";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/profile",
)({
  component: ProfileLayout,
});

function ProfileLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = location.pathname.includes("/profile/referral")
    ? "referral"
    : location.pathname.includes("/profile/sessions")
      ? "sessions"
      : "info";

  const handleTabChange = (val: string) => {
    const pathMap: Record<string, string> = {
      referral: "/profile/referral",
      sessions: "/profile/sessions",
      info: "/profile",
    };
    navigate({ to: pathMap[val] || "/profile" });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl w-full mx-auto">
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
      <Tabs value={currentTab} onChange={handleTabChange}>
        <Tab value="info" label="Informasi Profil" />
        <Tab value="referral" label="Referral & Afiliasi" />
        <Tab value="sessions" label="Sesi Login" />
      </Tabs>

      <Outlet />
    </div>
  );
}
