import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonRegisrationGoogle from "../-components/ButtonRegisrationGoogle";
import PasswordFields, { requirements } from "../-components/PassWordFields";
import ReferralOrInvitedCode from "../-components/ReferralOrInvitedCode";
import SuccessRegisration from "../-components/SuccessRegisration";
import { useRegisterMutation } from "../../-api/auth.query";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import RegisterLayout from "../-components/RegisterLayout";

export const Route = createFileRoute("/_guest/register/organization/")({
  component: RegisterOrganization,
});

function RegisterOrganization() {
  const { t } = useTranslation();

  // State Utama
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const isPasswordValid = Object.values(requirements(password)).every(Boolean);
  const passwordsMatch = password === confirmPassword;
  const canSubmit = isPasswordValid && passwordsMatch;

  const registerMutation = useRegisterMutation();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const inviteCode = showInvite ? (formData.get("inviteCode") as string) : "";
    registerMutation.mutate(
      {
        email,
        password,
        fullName,
        inviteCode,
        accountType: "ORGANIZATION",
      },
      { onSuccess: () => setSubmittedEmail(email) },
    );
  };

  if (registerMutation.isSuccess) {
    return <SuccessRegisration email={submittedEmail} />;
  }

  return (
    <RegisterLayout>
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
            {t("guest.register.emailAdminLabel")}
          </label>
          <Input
            type="email"
            placeholder="admin@perusahaan.com"
            required
            name="email"
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
          fieldName="inviteCode"
          show={showInvite}
          setShow={setShowInvite}
        />

        <Button type="submit" disabled={registerMutation.isPending}>
          {registerMutation.isPending
            ? t("guest.register.processing")
            : t("guest.register.submitOrganization")}
        </Button>

        <ButtonRegisrationGoogle fieldName="inviteCode" />
      </form>
    </RegisterLayout>
  );
}
