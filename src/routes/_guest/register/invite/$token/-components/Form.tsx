import type { UseMutationResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import ButtonRegisrationGoogle from "../../../-components/ButtonRegisrationGoogle";
import PasswordFields, {
  requirements,
} from "../../../-components/PassWordFields";
import type { RegisterRequest } from "../../../../-api/auth.api";
import Button from "../../../../../../components/ui/Button";
import Input from "../../../../../../components/ui/Input";
import type { ApiResponse } from "../../../../../../types";
import type { User } from "../../../../../../types/user";
import type { invitePayload } from "../../../../../_auth/_organization/members/-components/ModalInvite";

export default function FormInviteRegister({
  registerMutation,
  setSubmittedEmail,
  inviteData,
}: {
  inviteData: invitePayload | null;
  token: string;
  registerMutation: UseMutationResult<
    ApiResponse<User>,
    Error,
    RegisterRequest,
    unknown
  >;
  setSubmittedEmail: Dispatch<SetStateAction<string>>;
}) {
  const { t } = useTranslation();

  const devMode = import.meta.env.DEV;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isPasswordValid = Object.values(requirements(password)).every(Boolean);
  const passwordsMatch = password === confirmPassword;
  const canSubmit = isPasswordValid && passwordsMatch;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (!inviteData) return;

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const fullName = formData.get("fullName") as string;

    registerMutation.mutate(
      {
        email,
        fullName,
        password,
        accountType: "ORGANIZATION",
        invitedBy: inviteData.invitedBy,
        invitedOrganizationId: inviteData.invitedOrganizationId,
      },
      { onSuccess: () => setSubmittedEmail(email) },
    );
  };
  return (
    <>
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-info-main text-info-contrast font-black text-xs tracking-widest rounded-md mb-6">
          {t("guest.invite.badge")}
        </div>
        <h3 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
          {t("guest.invite.title")}
        </h3>
        <p className="text-text-secondary text-sm">
          {t("guest.invite.subtitle")}
        </p>
      </div>

      {/* Info Banner Status Undangan */}
      <div className="mb-6 p-4 bg-info-main/10 border border-info-light/30 rounded-2xl flex flex-col gap-1">
        <span className="text-info-dark text-xs font-bold uppercase tracking-wider">
          {t("guest.invite.statusLabel")}
        </span>
        <span className="text-info-main text-sm font-medium">
          {t("guest.invite.statusDirectAdd", {
            invitedBy: inviteData?.invitedName,
            invitedOrganizationName: inviteData?.invitedOrganizationName,
          })}
        </span>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            {t("guest.invite.fullNameLabel")}
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
            {t("guest.invite.emailLabel")}
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

        {devMode && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
              Data Registrasi (Otomatis)
            </label>
            <textarea
              value={JSON.stringify(inviteData, null, 2)}
              disabled
              rows={4}
              className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-divider/20 text-text-secondary cursor-not-allowed text-sm font-mono resize-none"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={registerMutation.isPending || !inviteData}
        >
          {registerMutation.isPending
            ? t("guest.invite.processing")
            : t("guest.invite.submitBtn")}
        </Button>

        <ButtonRegisrationGoogle
          fieldName="inviteToken"
          inviteToken={{
            invitedBy: inviteData?.invitedBy || "",
            invitedOrganizationId: inviteData?.invitedOrganizationId || "",
          }}
        />
      </form>

      <div className="mt-6 pt-6 border-t border-divider text-left text-sm text-text-secondary">
        {t("guest.invite.hasAccount")}{" "}
        <Link
          to="/login"
          preload={false}
          className="text-primary-main font-bold hover:underline"
        >
          {t("guest.invite.loginLink")}
        </Link>
      </div>
    </>
  );
}
