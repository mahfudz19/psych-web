// src/components/layout/Sidebar.tsx
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../hooks/useAuth";
import { useSidebar } from "../../contexts/SidebarContext";
import { menuConfig, type NavGroup, type NavItem } from "../../config/menu";

export function Sidebar() {
  const { user } = useAuth();
  const { isMobileOpen, isMini, toggleMobile } = useSidebar();

  // State untuk melacak menu mana yang sedang dibuka (Akordeon)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  if (!user) return null;

  // Fungsi Proteksi: Memeriksa apakah user berhak melihat menu/grup ini
  const checkAccess = (item: NavGroup | NavItem) => {
    const hasAccountAccess =
      !item.accountTypes || item.accountTypes.includes(user.accountType);
    const hasRoleAccess =
      !item.roles || item.roles.some((role) => user.roles?.includes(role));
    return hasAccountAccess && hasRoleAccess;
  };

  // Fungsi Toggle Akordeon
  const handleToggleExpand = (title: string) => {
    setExpandedMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title],
    );
  };

  return (
    <>
      {/* OVERLAY BACKDROP UNTUK MOBILE */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleMobile}
          aria-hidden="true"
        />
      )}

      {/* CONTAINER SIDEBAR */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-bg-paper border-r border-divider flex flex-col h-full shadow-sm
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isMini ? "lg:w-20" : "lg:w-64"}
          w-64
        `}
      >
        {/* LOGO AREA */}
        <div className="h-16 flex items-center justify-center px-4 border-b border-divider shrink-0">
          <h1 className="font-extrabold text-primary-main tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300">
            <span
              className={`text-2xl hidden ${isMini ? "lg:inline-block" : ""}`}
            >
              @
            </span>
            <span className={`text-xl ${isMini ? "lg:hidden" : ""}`}>
              @psych-web
            </span>
          </h1>
        </div>

        {/* NAVIGASI MENU */}
        {/* PERBAIKAN BUG: Jika isMini, kita hilangkan overflow-hidden agar kotak Flyout tidak terpotong (clipped) */}
        <nav
          className={`flex-1 px-3 py-6 space-y-1 custom-scrollbar ${isMini ? "overflow-visible" : "overflow-y-auto overflow-x-hidden"}`}
        >
          {menuConfig.filter(checkAccess).map((group, groupIdx) => (
            <div key={groupIdx} className="mb-8">
              {/* Label Grup ("Menu Utama", "Organisasi") */}
              <p
                className={`px-3 text-xs font-bold text-text-disabled uppercase tracking-widest mb-3 transition-opacity duration-300 ${isMini ? "lg:opacity-0 lg:invisible lg:h-0 lg:mb-0" : ""}`}
              >
                {group.groupLabel}
              </p>

              {group.items.filter(checkAccess).map((item, itemIdx) => {
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedMenus.includes(item.title);

                return (
                  <div key={itemIdx} className="relative group">
                    {/* MENU ITEM (Single atau Parent Submenu) */}
                    {hasChildren ? (
                      // Jika punya anak: Tampilkan sebagai tombol Akordeon
                      <button
                        onClick={() => handleToggleExpand(item.title)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-primary-main/10 hover:text-primary-main transition-colors focus:outline-none"
                      >
                        <div className="flex items-center">
                          {item.icon}
                          <span
                            className={`ml-3 transition-all duration-300 whitespace-nowrap ${isMini ? "lg:w-0 lg:opacity-0 lg:hidden" : ""}`}
                          >
                            {item.title}
                          </span>
                        </div>
                        {/* Ikon Chevron (Disembunyikan saat Mini Desktop) */}
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${isMini ? "lg:hidden" : ""} ${isExpanded ? "rotate-90" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    ) : (
                      // Jika menu tunggal: Langsung gunakan <Link>
                      <Link
                        to={item.path!}
                        onClick={() =>
                          window.innerWidth < 1024 && toggleMobile()
                        }
                        className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-primary-main/10 hover:text-primary-main [&.active]:bg-primary-main/10 [&.active]:text-primary-main transition-colors"
                      >
                        {item.icon}
                        <span
                          className={`ml-3 transition-all duration-300 whitespace-nowrap ${isMini ? "lg:w-0 lg:opacity-0 lg:hidden" : ""}`}
                        >
                          {item.title}
                        </span>
                      </Link>
                    )}

                    {/* INTERAKSI A: FLYOUT POPOVER UNTUK MODE MINI (DESKTOP SAJA) */}
                    {isMini && (
                      <div className="absolute left-full top-0 ml-2 w-48 bg-bg-paper border border-divider shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-60 hidden lg:block overflow-hidden">
                        <div className="px-4 py-3 bg-divider/20 border-b border-divider font-bold text-sm text-text-primary">
                          {item.title}
                        </div>
                        {hasChildren && (
                          <div className="py-1">
                            {item
                              .children!.filter(checkAccess)
                              .map((child, childIdx) => (
                                <Link
                                  key={childIdx}
                                  to={child.path!}
                                  className="block px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-primary-main/5 hover:text-primary-main [&.active]:text-primary-main"
                                >
                                  {child.title}
                                </Link>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* INTERAKSI B: AKORDEON SUBMENU UNTUK MODE NORMAL / MOBILE */}
                    {hasChildren && (
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isMini ? "lg:hidden" : ""} ${isExpanded ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
                      >
                        <div className="ml-7 pl-3 border-l-2 border-divider space-y-1 py-1">
                          {item
                            .children!.filter(checkAccess)
                            .map((child, childIdx) => (
                              <Link
                                key={childIdx}
                                to={child.path!}
                                onClick={() =>
                                  window.innerWidth < 1024 && toggleMobile()
                                }
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-primary-main hover:bg-primary-main/5 [&.active]:text-primary-main [&.active]:font-bold transition-colors"
                              >
                                {child.icon}
                                <span>{child.title}</span>
                              </Link>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* FOOTER SIDEBAR */}
        <div className="p-4 border-t border-divider shrink-0 overflow-hidden">
          <p
            className={`text-xs text-text-disabled font-medium whitespace-nowrap transition-all duration-300 text-center ${isMini ? "lg:opacity-0 lg:hidden" : ""}`}
          >
            &copy; 2026 PsyCorp
          </p>
          {isMini && (
            <p className="text-[10px] text-text-disabled font-bold text-center hidden lg:block">
              Psy
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
