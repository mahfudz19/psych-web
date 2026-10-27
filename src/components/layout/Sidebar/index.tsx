import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { twMerge } from "tailwind-merge";
import { useSidebar } from "../../../contexts/SidebarContext";
import { menuConfig, type NavGroup, type NavItem } from "./menu";
import { authStore } from "../../../utils/authStore";

export function Sidebar() {
  const { isMobileOpen, isMini, toggleMobile } = useSidebar();
  const { t } = useTranslation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const user = authStore.get().user;

  const checkAccess = (allowedRoles?: string[], allowedOrgRoles?: string[]) => {
    let roleMatch = true;
    if (allowedRoles && allowedRoles.length > 0) {
      roleMatch = allowedRoles.some((role) => user?.roles?.includes(role));
    }

    let orgRoleMatch = true;
    if (allowedOrgRoles && allowedOrgRoles.length > 0) {
      orgRoleMatch = allowedOrgRoles.includes(
        user?.organizationRole?.toString() || "",
      );
    }

    if (allowedRoles && allowedOrgRoles) return roleMatch && orgRoleMatch;

    return allowedRoles ? roleMatch : orgRoleMatch;
  };

  const dynamicMenu = useMemo(() => {
    return menuConfig
      .map((group) => {
        if (!checkAccess(group.roles, group.orgRoles)) return null;

        const filteredItems = group.items
          .map((item) => {
            if (!checkAccess(item.roles, item.orgRoles)) return null;

            if (item.children) {
              const filteredChildren = item.children.filter((child) =>
                checkAccess(child.roles, child.orgRoles),
              );

              if (filteredChildren.length === 0) return null;

              return { ...item, children: filteredChildren };
            }

            return item;
          })
          .filter(Boolean) as NavItem[];

        if (filteredItems.length === 0) return null;

        return { ...group, items: filteredItems };
      })
      .filter(Boolean) as NavGroup[];
  }, [user]);

  const handleToggleExpand = (titleKey: string) => {
    setExpandedMenus((prev) =>
      prev.includes(titleKey)
        ? prev.filter((item) => item !== titleKey)
        : [...prev, titleKey],
    );
  };

  const location = useLocation();

  useEffect(() => {
    const activeKeys = dynamicMenu
      .flatMap((group) => group.items)
      .filter((item) =>
        item.children?.some(
          (child) =>
            child.path &&
            (location.pathname === child.path ||
              location.pathname.startsWith(`${child.path}/`)),
        ),
      )
      .map((item) => item.titleKey);

    if (activeKeys.length > 0) {
      setExpandedMenus((prev) => Array.from(new Set([...prev, ...activeKeys])));
    }
  }, [location.pathname, dynamicMenu]);

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleMobile}
          aria-hidden="true"
        />
      )}
      <div className="p-0 lg:p-4 z-50">
        <aside
          className={twMerge(
            "fixed lg:static inset-y-0 left-0 flex flex-col h-full rounded-2xl shadow-xl",
            "transition-all duration-300 ease-in-out border-none",
            /* BACKGROUND GRADIENT UTAMA */
            "bg-linear-to-b from-primary-main to-primary-dark text-primary-contrast",
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0",
            isMini ? "lg:w-20" : "lg:w-64",
            "w-64",
          )}
        >
          {/* HEADER LOGO */}
          <div className="h-16 flex items-center justify-center px-4 border-b border-primary-contrast/20 shrink-0">
            <h1 className="font-extrabold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 text-primary-contrast">
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

          <nav
            className={`flex-1 px-3 py-6 space-y-4 custom-scrollbar ${isMini ? "overflow-visible" : "overflow-y-auto overflow-x-hidden"}`}
          >
            {dynamicMenu.map((group, groupIdx) => (
              <div
                key={groupIdx}
                className={`${
                  groupIdx > 0 && isMini
                    ? "border-t border-primary-contrast/20 pt-4"
                    : undefined
                }`}
              >
                {/* GROUP LABEL */}
                <p
                  className={`px-3 text-xs font-bold text-primary-contrast/60 uppercase tracking-widest mb-3 transition-opacity duration-300 ${isMini ? "lg:opacity-0 lg:invisible lg:h-0 lg:mb-0" : ""}`}
                >
                  {t(group.groupLabelKey as any)}
                </p>

                {group.items.map((item, itemIdx) => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedMenus.includes(item.titleKey);

                  return (
                    <div key={itemIdx} className="relative group">
                      {hasChildren ? (
                        <button
                          onClick={() => handleToggleExpand(item.titleKey)}
                          className={`w-full flex items-center ${isMini ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-xl text-sm font-medium text-primary-contrast/80 hover:bg-primary-contrast/10 hover:text-primary-contrast transition-all focus:outline-none`}
                        >
                          <div className="flex items-center">
                            {item.icon}
                            <span
                              className={`ml-3 transition-all duration-300 whitespace-nowrap ${isMini ? "lg:w-0 lg:opacity-0 lg:hidden" : ""}`}
                            >
                              {t(item.titleKey as any)}
                            </span>
                          </div>
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
                        /* MAIN ITEM */
                        <Link
                          to={item.path!}
                          onClick={() =>
                            window.innerWidth < 1024 && toggleMobile()
                          }
                          className={`flex items-center ${isMini ? "justify-center" : ""} px-3 py-2.5 rounded-xl text-sm font-medium text-primary-contrast/80 hover:bg-primary-contrast/10 hover:text-primary-contrast [&.active]:bg-primary-contrast/20 [&.active]:text-primary-contrast [&.active]:shadow-inner [&.active]:font-semibold transition-all duration-200`}
                        >
                          {item.icon}
                          <span
                            className={`ml-3 transition-all duration-300 whitespace-nowrap ${isMini ? "lg:w-0 lg:opacity-0 lg:hidden" : ""}`}
                          >
                            {t(item.titleKey as any)}
                          </span>
                        </Link>
                      )}

                      {/* MINI MODE POPOVER (Hover) */}
                      {isMini && (
                        <div className="absolute left-full top-0 ml-2 w-48 bg-primary-dark border border-primary-contrast/20 shadow-xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-60 hidden lg:block overflow-hidden">
                          <div className="px-4 py-3 bg-primary-contrast/10 border-b border-primary-contrast/20 font-bold text-sm text-primary-contrast">
                            {t(item.titleKey as any)}
                          </div>
                          {hasChildren && (
                            <div className="py-1">
                              {(item.children || []).map((child, childIdx) => (
                                <Link
                                  key={childIdx}
                                  to={child.path!}
                                  className="block px-4 py-2.5 text-sm font-medium text-primary-contrast/80 hover:bg-primary-contrast/10 hover:text-primary-contrast [&.active]:text-primary-contrast [&.active]:bg-primary-contrast/20"
                                >
                                  {t(child.titleKey as any)}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* SUB MENU ITEM */}
                      {hasChildren && (
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${isMini ? "lg:hidden" : ""} ${isExpanded ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
                        >
                          <div className="ml-7 pl-3 border-l border-primary-contrast/30 space-y-1 py-1">
                            {(item.children || []).map((child, childIdx) => (
                              <Link
                                key={childIdx}
                                to={child.path!}
                                onClick={() =>
                                  window.innerWidth < 1024 && toggleMobile()
                                }
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-primary-contrast/70 hover:text-primary-contrast hover:bg-primary-contrast/10 [&.active]:text-primary-contrast [&.active]:bg-primary-contrast/20 [&.active]:font-semibold transition-all"
                              >
                                {child.icon}
                                <span>{t(child.titleKey as any)}</span>
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

          {/* FOOTER */}
          <div className="p-4 border-t border-primary-contrast/20 shrink-0 overflow-hidden">
            <p
              className={`text-xs text-primary-contrast/60 font-medium whitespace-nowrap transition-all duration-300 text-center ${isMini ? "lg:opacity-0 lg:hidden" : ""}`}
            >
              &copy; {new Date().getFullYear()} PsyCorp
            </p>
            {isMini && (
              <p className="text-[10px] text-primary-contrast/60 font-bold text-center hidden lg:block">
                Psy
              </p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
