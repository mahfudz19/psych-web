import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthSplitLayout } from "../../-components/AuthSplitLayout";
import { useRegisterMutation } from "../api/register.query";

export const Route = createFileRoute("/_guest/register/organization/")({
  component: RegisterOrganization,
});

function RegisterOrganization() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    organizationName: "",
  });

  const registerMutation = useRegisterMutation();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const inviteCode = formData.get("inviteCode") as string;
    registerMutation.mutate({
      email,
      password,
      fullName,
      inviteCode,
      accountType: "ORGANIZATION",
    });
  };

  return (
    <AuthSplitLayout layoutKey="registerOrganization" imagePosition="right">
      <div className="mb-8">
        <h3 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
          {t("guest.register.title")}
        </h3>
        <p className="text-text-secondary text-sm mb-6">
          {t("guest.register.subtitle")}
        </p>

        {/* TAB TOGGLE: Organisasi Aktif, Individu Inaktif */}
        <div className="flex p-1 bg-divider/10 rounded-2xl mb-2">
          <Link
            to="/register"
            className="flex-1 py-2 text-sm font-medium text-text-secondary text-center hover:text-text-primary transition-all"
          >
            {t("guest.register.individualTab")}
          </Link>
          <button className="flex-1 py-2 text-sm font-bold bg-bg-paper text-primary-main rounded-xl shadow-sm border border-divider transition-all">
            {t("guest.register.organizationTab")}
          </button>
        </div>
      </div>

      {registerMutation.isError && (
        <div className="mb-6 p-3.5 bg-error-main/10 border-l-4 border-error-main rounded-r-md">
          <p className="text-error-main text-xs font-semibold">
            {t("guest.register.error")}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            {t("guest.register.fullNameLabel")}
          </label>
          <input
            type="text"
            placeholder={t("guest.register.fullNamePlaceholder")}
            required
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            {t("guest.register.emailLabel")}
          </label>
          <input
            type="email"
            placeholder="admin@perusahaan.com"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            {t("guest.register.passwordLabel")}
          </label>
          <input
            type="password"
            placeholder={t("guest.register.passwordPlaceholder")}
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 justify-between">
            <span>{t("guest.register.organizationNameLabel")}</span>
            <span className="text-text-disabled font-normal normal-case">
              {t("guest.register.referralOptional")}
            </span>
          </label>
          <input
            type="text"
            placeholder="inviteCode"
            name="inviteCode"
            value={formData.organizationName}
            onChange={(e) =>
              setFormData({ ...formData, organizationName: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full mt-4 py-3 px-4 bg-primary-main text-primary-contrast rounded-2xl font-bold text-sm hover:bg-primary-dark active:scale-[0.99] focus:outline-none disabled:opacity-50 transition-all shadow-md shadow-primary-main/20"
        >
          {registerMutation.isPending
            ? t("guest.register.processing")
            : t("guest.register.submitOrganization")}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-divider text-left text-sm text-text-secondary">
        {t("guest.register.hasAccount")}{" "}
        <Link
          to="/login"
          className="text-primary-main font-bold hover:underline"
        >
          {t("guest.register.loginLink")}
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
