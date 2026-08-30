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
    </>
  );
}
