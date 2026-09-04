import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useLogoutMutation } from "../../../routes/_guest/-api/auth.query";
import Menu from "../../ui/Menu";
import Button from "../../ui/Button";
import MenuDivider from "../../ui/Menu/MenuDivider";
import MenuHeader from "../../ui/Menu/MenuHeader";
import MenuItem from "../../ui/Menu/MenuItem";
import Skeleton from "../../ui/Skeleton";

export interface ProfileDropdownProps {
  fullName: string;
  accountType: string;
  email: string;
  subscriptionTier: string;
  status: string;
}

function ProfileDropdown(props: ProfileDropdownProps) {
  const { fullName, accountType, email, subscriptionTier, status } = props;
  const { t } = useTranslation();
  const logout = useLogoutMutation();
  const navigate = useNavigate();

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <Menu
      position="bottom-end"
      widthClass="w-64"
      skeleton={
        <Skeleton height={46.28} className="w-16 sm:w-40" variant="rounded" />
      }
      trigger={
        <Button
          size="sm"
          variant="text"
          startIcon={
            <div className="w-7 h-7 rounded-full bg-primary-main text-primary-contrast flex items-center justify-center text-xs font-bold shadow-sm">
              {getInitials(fullName)}
            </div>
          }
          endIcon={
            <svg
              className="w-4 h-4 transition-transform duration-200 hidden sm:block group-data-[state=open]:rotate-180"
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
          }
          className="text-sm"
        >
          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-xs font-bold text-text-primary leading-none">
              {fullName}
            </span>
            <span className="text-[10px] text-text-secondary uppercase mt-1 tracking-wider">
              {accountType}
            </span>
          </div>
        </Button>
      }
    >
      {(close) => (
        <div className="flex flex-col pb-1">
          <MenuHeader>
            <p className="text-sm font-bold text-text-primary truncate">
              {fullName}
            </p>
            <p className="text-xs text-text-secondary truncate mt-0.5">
              {email}
            </p>
            <div className="flex gap-2 mt-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-info-main/10 text-info-main">
                Tier: {subscriptionTier}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-success-main/10 text-success-main">
                {status}
              </span>
            </div>
          </MenuHeader>

          <div className="flex flex-col gap-0.5 p-1">
            <MenuItem
              active={currentPath === "/profile"}
              onClick={() => {
                close();
                navigate({ to: "/profile" });
              }}
              iconStart={
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
              }
            >
              {t("topbar.profileSettings")}
            </MenuItem>

            <MenuItem
              active={currentPath === "/billing"}
              onClick={() => {
                close();
                navigate({ to: "/billing" });
              }}
              iconStart={
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
              }
            >
              {t("sidebar.billing")}
            </MenuItem>
          </div>

          <MenuDivider />

          <div className="p-1">
            <MenuItem
              rippleColor="error"
              className="text-error-main hover:bg-error-main/10 hover:text-error-main focus:bg-error-main/10 focus:text-error-main disabled:opacity-50"
              onClick={() => {
                if (logout.isPending) return;
                close();
                logout.mutate();
              }}
              iconStart={
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
              }
            >
              {logout.isPending ? t("topbar.loggingOut") : t("topbar.logout")}
            </MenuItem>
          </div>
        </div>
      )}
    </Menu>
  );
}

export default ProfileDropdown;
