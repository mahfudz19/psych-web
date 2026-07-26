import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AuthSplitLayout } from "../../-components/AuthSplitLayout";
import { useRegisterMutation } from "../api/register.query";
import PassworfField from "../../-components/PassworfField";
import Input from "../../../../components/ui/Input";
import Button from "../../../../components/ui/Button";

export const Route = createFileRoute("/_guest/register/organization/")({
  component: RegisterOrganization,
});

function RegisterOrganization() {
  const { t } = useTranslation();

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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            {t("guest.register.fullNameLabel")}
          </label>
          <Input
            type="text"
            placeholder={t("guest.register.fullNamePlaceholder")}
            required
            name="fullName"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            {t("guest.register.emailLabel")}
          </label>
          <Input
            type="email"
            placeholder="admin@perusahaan.com"
            required
            name="email"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            {t("guest.register.passwordLabel")}
          </label>
          <PassworfField
            type="password"
            placeholder={t("guest.register.passwordPlaceholder")}
            required
            name="password"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 justify-between">
            <span>{t("guest.register.organizationNameLabel")}</span>{" "}
            <span className="text-text-disabled font-normal normal-case">
              {t("guest.register.referralOptional")}
            </span>
          </label>
          <Input
            type="text"
            placeholder="inviteCode"
            name="inviteCode"
            className="w-full"
          />
        </div>

        <Button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending
            ? t("guest.register.processing")
            : t("guest.register.submitOrganization")}
        </Button>
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
