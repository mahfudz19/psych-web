import { useAuth } from "../../../hooks/useAuth";
import DarkMode from "./DarkMode";
import ProfileDropdown from "./ProfileDropdown";
import ToggleSidebar from "./ToggleSidebar";

export function Topbar() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <header className="h-16 bg-bg-paper border-b border-divider flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shadow-sm transition-all">
      <div className="flex items-center gap-2 lg:gap-4">
        <ToggleSidebar />

        <span className="text-sm font-medium text-text-secondary hidden sm:inline-block pl-2 lg:pl-0">
          Selamat datang,{" "}
          <strong className="text-text-primary font-bold">
            {user.fullName.split(" ")[0]}
          </strong>
        </span>
      </div>

      <div className="flex items-center space-x-3 lg:space-x-4">
        <DarkMode />
        <div className="h-6 w-px bg-divider mx-1 hidden sm:block"></div>
        <ProfileDropdown />
      </div>
    </header>
  );
}
