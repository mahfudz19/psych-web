import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../hooks/useAuth";

function ProfileDropdown() {
  const { user, logout, isLoggingOut } = useAuth();
  const { t } = useTranslation();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const closeDropdown = () => {
    const checkbox = document.getElementById(
      "profile-toggle",
    ) as HTMLInputElement;
    if (checkbox) checkbox.checked = false;
  };

  return (
    <div className="relative">
      <input type="checkbox" id="profile-toggle" className="peer hidden" />

      <label
        htmlFor="profile-toggle"
        className="fixed inset-0 z-40 hidden peer-checked:block"
        aria-hidden="true"
      ></label>

      <label
        htmlFor="profile-toggle"
        className="cursor-pointer relative z-30 flex items-center gap-3 p-1.5 md:pr-3 rounded-xl text-text-secondary hover:bg-divider/20 peer-checked:bg-divider/20 transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-primary-main text-primary-contrast flex items-center justify-center text-xs font-bold shadow-sm">
          {getInitials(user.fullName)}
        </div>
        <div className="hidden sm:flex flex-col items-start text-left">
          <span className="text-xs font-bold text-text-primary leading-none">
            {user.fullName}
          </span>
          <span className="text-[10px] text-text-secondary uppercase mt-1 tracking-wider">
            {user.accountType}
          </span>
        </div>
        <svg
          className="w-4 h-4 transition-transform duration-200 hidden sm:block peer-checked:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </label>

      {/* KONTEN DROPDOWN PROFIL: Diperhalus jarak dan lengkungannya */}
      <div className="absolute right-0 mt-3 w-64 bg-bg-paper rounded-2xl shadow-xl border border-divider p-2 z-50 origin-top-right transition-all duration-200 ease-out scale-95 opacity-0 invisible peer-checked:scale-100 peer-checked:opacity-100 peer-checked:visible">
        {/* Header Informasi Akun */}
        <div className="px-3 py-3 border-b border-divider">
          <p className="text-sm font-bold text-text-primary truncate">
            {user.fullName}
          </p>
          <p className="text-xs text-text-secondary truncate mt-0.5">
            {user.email}
          </p>
          <div className="flex gap-2 mt-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-info-main/10 text-info-main">
              Tier: {user.subscriptionTier}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-success-main/10 text-success-main">
              {user.status}
            </span>
          </div>
        </div>

        {/* Tautan Menu */}
        <div className="py-1.5 space-y-0.5">
          <Link
            to="/profile"
            onClick={closeDropdown}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-divider/20 hover:text-text-primary transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {t("topbar.profileSettings")}
          </Link>
          <Link
            to="/billing"
            onClick={closeDropdown}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-divider/20 hover:text-text-primary transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            {t("sidebar.billing")}
          </Link>
        </div>

        {/* Tombol Logout */}
        <div className="pt-1.5 border-t border-divider">
          <button
            onClick={() => {
              closeDropdown();
              logout();
            }}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-error-main hover:bg-error-main/10 transition-colors disabled:opacity-50 text-left"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1"
              />
            </svg>
            {isLoggingOut ? t("topbar.loggingOut") : t("topbar.logout")}
          </button>
        </div>
      </div>
    </div>
  );
}

ProfileDropdown.displayName = "ProfileDropdown";

export default ProfileDropdown;
