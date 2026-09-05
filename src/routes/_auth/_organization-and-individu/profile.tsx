import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import Tabs from "../../../components/ui/Tabs";
import Tab from "../../../components/ui/Tabs/Tab";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/profile",
)({
  component: ProfileLayout,
});

function ProfileLayout() {
  const { t } = useTranslation();
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
            {t("profile.title")}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t("profile.subtitle")}
          </p>
        </div>
        <Link
          to="/portal"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-text-secondary bg-divider/20 hover:bg-divider/40 transition-colors w-fit"
        >
          {t("profile.backToPortal")}
        </Link>
      </div>

      {/* NAVIGASI TAB */}
      <Tabs value={currentTab} onChange={handleTabChange}>
        <Tab value="info" label={t("profile.tabs.info")} />
        <Tab value="referral" label={t("profile.tabs.referral")} />
        <Tab value="sessions" label={t("profile.tabs.sessions")} />
      </Tabs>

      <Outlet />
    </div>
  );
}
