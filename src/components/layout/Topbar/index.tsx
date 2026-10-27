import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../utils/authStore";
import DarkMode from "./DarkMode";
import LanguageSwitcher from "./LanguageSwitcher";
import ProfileDropdown from "./ProfileDropdown";
import ToggleSidebar from "./ToggleSidebar";

export function Topbar() {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const cleanupRef = useRef<(() => void) | null>(null);

  const headerRef = (headerEl: HTMLElement | null) => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    if (!headerEl) return;

    const scrollContainer =
      headerEl.closest<HTMLElement>("#main-scroll-area") ||
      headerEl.closest<HTMLElement>(".overflow-y-auto");

    if (!scrollContainer) return;

    const handleScroll = () => {
      const isScrolled = scrollContainer.scrollTop > 10;
      headerEl.setAttribute("data-scrolled", String(isScrolled));
    };

    handleScroll();

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

    cleanupRef.current = () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  };

  return (
    <header
      ref={headerRef}
      data-scrolled="false"
      className="h-16 flex items-center justify-between px-2 rounded-b sticky top-0 z-40 transition-all duration-300 border-b shadow-none border-transparent data-[scrolled=true]:bg-bg-paper/70 data-[scrolled=true]:backdrop-blur-sm data-[scrolled=true]:border-divider/50 data-[scrolled=true]:shadow-xs"
    >
      <div className="flex items-center gap-2 lg:gap-4">
        <ToggleSidebar />

        <span className="text-sm font-medium text-text-secondary hidden sm:inline-block pl-2 lg:pl-0">
          {t("topbar.welcome")},{" "}
          <strong className="text-text-primary font-bold">
            {user?.fullName?.split(" ")[0] || "A"}
          </strong>
        </span>
      </div>

      <div className="flex items-center space-x-3 lg:space-x-4">
        <LanguageSwitcher />
        <DarkMode />
        <div className="h-6 w-px bg-divider mx-1 hidden sm:block"></div>
        <ProfileDropdown />
      </div>
    </header>
  );
}
