import { useMatches } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";
import DarkMode from "../../../components/layout/Topbar/DarkMode";
import LanguageSwitcher from "../../../components/layout/Topbar/LanguageSwitcher";

type layoutKey =
  | "login"
  | "registerIndividual"
  | "registerOrganization"
  | "registerInvite"
  | "resetPassword";
type imagePosition = "left" | "right";

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  const matches = useMatches();
  const currentMatch = matches[matches.length - 1];
  const path = currentMatch?.pathname || "";

  let layoutKey: layoutKey = "login";
  let imagePosition: imagePosition = "left";

  if (path.includes("/register/invite")) {
    layoutKey = "registerInvite";
    imagePosition = "right";
  } else if (path.includes("/register/verify-email")) {
    layoutKey = "registerIndividual";
    imagePosition = "left";
  } else if (path.includes("/register")) {
    layoutKey = "registerIndividual";
    imagePosition = "right";
  } else if (
    path.includes("/reset-password") ||
    path.includes("/forgot-password")
  ) {
    layoutKey = "resetPassword";
    imagePosition = "left";
  }

  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full bg-bg-default text-text-primary relative flex lg:block bg-linear-to-br from-primary-main/10 via-bg-default to-secondary-main/10 shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-[0_0_40px_rgba(0,0,0,0.2)]">
      {/* Panel Grafis (Kiri / Kanan) */}
      <div
        className={`hidden lg:flex fixed top-0 bottom-0 w-[70%] items-center justify-center p-16 transition-all duration-1000 ease-in-out
          ${imagePosition === "left" ? "left-0" : "left-[30%]"}
        `}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-main/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-main/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl text-left">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary-main/10 text-primary-main border border-primary-main/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary-main animate-pulse" />
            {t("layout.methodBadge")}
          </span>

          <h2 className="text-4xl xl:text-5xl font-extrabold text-text-primary tracking-tight leading-tight mb-6">
            {t(`layout.${layoutKey}.title`)}
          </h2>

          <p className="text-text-secondary text-lg leading-relaxed mb-8">
            {t(`layout.${layoutKey}.subtitle`)}
          </p>

          <div className="pt-8 border-t border-divider grid grid-cols-2 gap-8">
            <div>
              <p className="text-2xl font-bold text-primary-main">100%</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {t("layout.stats.validated")}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-main">
                B2B & B2C
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                {t("layout.stats.readyForOrg")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Form */}
      <div
        className={`relative min-h-screen top-0 h-full w-full lg:w-[30%] z-10 flex flex-1 items-center justify-center p-8 sm:p-12 lg:p-14 bg-bg-default transition-all duration-1000 ease-in-out
          ${imagePosition === "left" ? "lg:left-[70%]" : "lg:left-0"}
        `}
      >
        <div className="w-full max-w-sm">{children}</div>
      </div>

      <div className="fixed top-5 right-5 flex gap-1 items-center justify-center z-50">
        <DarkMode />
        <LanguageSwitcher />
      </div>
    </div>
  );
}
