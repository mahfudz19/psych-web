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

const PROFILE_TABS = [
  { value: "info", path: "/profile" },
  { value: "referral", path: "/profile/referral" },
  { value: "sessions", path: "/profile/sessions" },
  { value: "change-password", path: "/profile/change-password" },
] as const;

function ProfileLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab =
    PROFILE_TABS.slice()
      .sort((a, b) => b.path.length - a.path.length)
      .find((tab) => location.pathname.startsWith(tab.path))?.value || "info";

  const handleTabChange = (val: string) => {
    const targetPath =
      PROFILE_TABS.find((tab) => tab.value === val)?.path || "/profile";
    navigate({ to: targetPath });
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

      {/* 3. Render secara iteratif */}
      <Tabs value={currentTab} onChange={handleTabChange}>
        {PROFILE_TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={t(`profile.tabs.${tab.value}`)}
          />
        ))}
      </Tabs>

      <Outlet />
    </div>
  );
}
