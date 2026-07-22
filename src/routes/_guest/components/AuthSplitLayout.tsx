import React from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../../components/layout/Topbar/LanguageSwitcher";
import DarkMode from "../../../components/layout/Topbar/DarkMode";

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  layoutKey:
    "login" | "registerIndividual" | "registerOrganization" | "registerInvite";
  imagePosition?: "left" | "right";
}

/**
 * Layout komponen untuk halaman autentikasi (login/register) dengan
 * tampilan split antara form dan branding visual.
 * @param children - Konten form yang akan ditampilkan
 * @param layoutKey - Key translasi untuk layout (login, registerIndividual, registerOrganization, registerInvite)
 * @param imagePosition - Posisi gambar branding (left atau right)
 */
export function AuthSplitLayout({
  children,
  layoutKey,
  imagePosition = "left",
}: AuthSplitLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex w-full bg-bg-default text-text-primary overflow-hidden relative">
      {/* SISI BRANDING / VISUAL (70% Lebar Layar) */}
      <div
        className={`hidden lg:flex lg:w-[70%] relative items-center justify-center p-16 bg-linear-to-br from-primary-main/10 via-bg-default to-secondary-main/10
          ${imagePosition === "right" ? "order-2" : "order-1"}
        `}
      >
        {/* Dekorasi Aksen Visual Minimalis (Glow Effect) */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-main/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-main/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl text-left">
          {/* Badge/Pill */}
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

          {/* Statistik / Social Proof Kecil agar Lebih Menarik */}
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

      {/* SISI FORMULIR (30% Lebar Layar - Seamless / Tanpa Card) */}
      <div
        className={`flex flex-1 items-center justify-center p-8 sm:p-12 lg:p-14 lg:w-[30%] bg-bg-default
          ${imagePosition === "right" ? "order-1" : "order-2"}
        `}
      >
        {/* Tanpa bg-bg-paper, tanpa shadow, tanpa border card */}
        <div className="w-full max-w-sm">{children}</div>
      </div>

      <div className="absolute top-5 right-5 flex gap-1 items-center justify-center">
        <DarkMode />
        <LanguageSwitcher />
      </div>
    </div>
  );
}
