import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";

function ProfileDropdown() {
  const { user, logout, isLoggingOut } = useAuth();

  // State untuk Dropdown Profil
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Efek untuk mendeteksi klik di luar dropdown agar otomatis tertutup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fungsi utilitas untuk mengambil 2 huruf pertama dari nama
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol Pemicu Dropdown */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 p-1 pr-2 rounded-full border border-divider hover:border-primary-main/50 bg-bg-default focus:outline-none transition-all"
        aria-haspopup="true"
        aria-expanded={isDropdownOpen}
      >
        {/* Avatar Inisial */}
        <div className="w-8 h-8 rounded-full bg-primary-main text-primary-contrast flex items-center justify-center text-xs font-bold shadow-sm">
          {getInitials(user.fullName)}
        </div>

        {/* Nama & Role (Sembunyi di Mobile) */}
        <div className="hidden sm:flex flex-col items-start text-left">
          <span className="text-xs font-bold text-text-primary leading-none">
            {user.fullName}
          </span>
          <span className="text-[10px] text-text-secondary uppercase mt-1 tracking-wider">
            {user.accountType}
          </span>
        </div>

        {/* Ikon Chevron */}
        <svg
          className={`w-4 h-4 text-text-disabled transition-transform duration-200 hidden sm:block ${isDropdownOpen ? "rotate-180" : ""}`}
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
      </button>

      {/* Panel Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-bg-paper rounded-xl shadow-lg border border-divider py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Info Detail Header */}
          <div className="px-4 py-3 border-b border-divider">
            <p className="text-sm font-bold text-text-primary truncate">
              {user.fullName}
            </p>
            <p className="text-xs text-text-secondary truncate mt-0.5">
              {user.email}
            </p>

            <div className="flex gap-2 mt-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-info-main/10 text-info-main">
                Tier: {user.subscriptionTier}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-success-main/10 text-success-main">
                {user.status}
              </span>
            </div>
          </div>

          {/* Menu Profil */}
          <div className="px-2 py-2">
            <Link
              to="/profile"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-primary-main/10 hover:text-primary-main transition-colors"
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
              Pengaturan Profil
            </Link>
            <Link
              to="/billing"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-primary-main/10 hover:text-primary-main transition-colors mt-1"
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
              Tagihan & Langganan
            </Link>
          </div>

          {/* Aksi Logout */}
          <div className="px-2 pt-2 border-t border-divider">
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                logout();
              }}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-error-main hover:bg-error-main/10 transition-colors disabled:opacity-50 text-left"
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
              {isLoggingOut ? "Keluar..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
