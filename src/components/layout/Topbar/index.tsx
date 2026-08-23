import { useTranslation } from "react-i18next";
import DarkMode from "./DarkMode";
import ProfileDropdown, { type ProfileDropdownProps } from "./ProfileDropdown";
import ToggleSidebar from "./ToggleSidebar";
import LanguageSwitcher from "./LanguageSwitcher";

export function Topbar(props: ProfileDropdownProps) {
  const { t } = useTranslation(); // Inisialisasi translasi

  return (
    <header className="h-16 bg-bg-paper border-b border-divider flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shadow-sm transition-all">
      <div className="flex items-center gap-2 lg:gap-4">
        <ToggleSidebar />

        <span className="text-sm font-medium text-text-secondary hidden sm:inline-block pl-2 lg:pl-0">
          {t("topbar.welcome")},{" "}
          <strong className="text-text-primary font-bold">
            {props.fullName?.split(" ")[0] || "A"}
          </strong>
        </span>
      </div>

      <div className="flex items-center space-x-3 lg:space-x-4">
        <LanguageSwitcher />
        <DarkMode />
        <div className="h-6 w-px bg-divider mx-1 hidden sm:block"></div>
        <ProfileDropdown {...props} />
      </div>
    </header>
  );
}
