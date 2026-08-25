import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRegisterMutation } from "../-api/auth.query";
import { AuthSplitLayout } from "../-components/AuthSplitLayout";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import PasswordFields, { requirements } from "./-components/PassWordFields";
import ReferralOrInvitedCode from "./-components/ReferralOrInvitedCode";
import SuccessRegisration from "./-components/SuccessRegisration";

export const Route = createFileRoute("/_guest/register/")({
  component: RegisterIndividual,
});

function RegisterIndividual() {
  const { t } = useTranslation();
  const registerMutation = useRegisterMutation();

  // State Utama
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showReferral, setShowReferral] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const isPasswordValid = Object.values(requirements(password)).every(Boolean);
  const passwordsMatch = password === confirmPassword;
  const canSubmit = isPasswordValid && passwordsMatch;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const fullName = formData.get("fullName") as string;
    const referralCode = showReferral
      ? (formData.get("referralCode") as string)
      : "";

    registerMutation.mutate(
      { email, password, fullName, referralCode, accountType: "INDIVIDUAL" },
      {
        onSuccess: () => {
          setSubmittedEmail(email);
        },
      },
    );
  };

  return (
    <AuthSplitLayout layoutKey="registerIndividual" imagePosition="right">
      {!registerMutation.isSuccess ? (
        <div className="animate-in fade-in duration-500">
          <div className="mb-8">
            <h3 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
              {t("guest.register.title")}
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              {t("guest.register.subtitle")}
            </p>

            <div className="flex p-1 bg-divider/10 rounded-2xl mb-2">
              <button className="flex-1 py-2 text-sm font-bold bg-bg-paper text-primary-main rounded-xl shadow-sm border border-divider transition-all">
                {t("guest.register.individualTab")}
              </button>
              <Link
                to="/register/organization"
                className="flex-1 py-2 text-sm font-medium text-text-secondary text-center hover:text-text-primary transition-all"
              >
                {t("guest.register.organizationTab")}
              </Link>
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
                name="email"
                placeholder={t("guest.register.emailPlaceholder")}
                required
                className="w-full"
              />
            </div>

            <PasswordFields
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              requirements={requirements(password)}
              passwordsMatch={passwordsMatch}
            />

            <ReferralOrInvitedCode
              fieldName="referralCode"
              show={showReferral}
              setShow={setShowReferral}
            />

            <Button type="submit" disabled={registerMutation.isPending}>
              {registerMutation.isPending
                ? t("guest.register.processing")
                : t("guest.register.submitIndividual")}
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
        </div>
      ) : (
        <SuccessRegisration email={submittedEmail} />
      )}
    </AuthSplitLayout>
  );
}
