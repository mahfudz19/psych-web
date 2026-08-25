import { Link, useMatchRoute } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";

function RegisterLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const matchRoute = useMatchRoute();
  const isIndividualActive = !!matchRoute({ to: "/register", fuzzy: true });
  const isOrganizationActive = !!matchRoute({
    to: "/register/organization",
    fuzzy: true,
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h3 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
          {t("guest.register.title")}
        </h3>
        <p className="text-text-secondary text-sm mb-6">
          {t("guest.register.subtitle")}
        </p>

        <div className="flex p-1 bg-divider/75 rounded-2xl mb-2">
          <Link
            to="/register"
            preload={false}
            activeOptions={{ exact: isIndividualActive }}
            activeProps={{
              className: "bg-bg-paper rounded-xl text-text-primary shadow-sm",
            }}
            className="flex-1 py-2 text-sm font-medium text-text-secondary text-center hover:text-text-primary transition-all"
          >
            {t("guest.register.individualTab")}
          </Link>
          <Link
            to="/register/organization"
            preload={false}
            activeOptions={{ exact: isOrganizationActive }}
            activeProps={{
              className: "bg-bg-paper rounded-xl text-text-primary shadow-sm",
            }}
            className="flex-1 py-2 text-sm font-medium text-text-secondary text-center hover:text-text-primary transition-all"
          >
            {t("guest.register.organizationTab")}
          </Link>
        </div>
      </div>
      {children}
      <div className="mt-6 pt-6 border-t border-divider text-left text-sm text-text-secondary">
        {t("guest.register.hasAccount")}{" "}
        <Link
          to="/login"
          preload={false}
          className="text-primary-main font-bold hover:underline"
        >
          {t("guest.register.loginLink")}
        </Link>
      </div>
    </div>
  );
}

export default RegisterLayout;
