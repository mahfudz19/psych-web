import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../../../components/ui/Button";
import Input from "../../../../../components/ui/Input";
import Label from "../../../../../components/ui/Label";
import toast from "../../../../../components/ui/Toast";
import { useChangePasswordMutation } from "../../../../_guest/-api/auth.query";
import PasswordFields, {
  requirements,
} from "../../../../_guest/register/-components/PassWordFields";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/profile/change-password/",
)({
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const { t } = useTranslation();
  const changePasswordMutation = useChangePasswordMutation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordsMatch = password === confirmPassword;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const oldPassword = formData.get("oldPassword") as string;
    const newPassword = formData.get("password") as string;
    const confirmPasswordInput = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPasswordInput)
      return toast.error(t("profile.changePassword.mismatchError"));

    if (newPassword.length < 8)
      return toast.error(t("profile.changePassword.minLengthError"));

    changePasswordMutation.mutate(
      { oldPassword, newPassword },
      { onSuccess: () => form.reset() },
    );
  };

  return (
    <div className="max-w-md bg-bg-paper p-6 rounded-3xl border border-divider shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
          {t("profile.changePassword.title")}
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          {t("profile.changePassword.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="oldPassword">
            {t("profile.changePassword.oldPasswordLabel")}
          </Label>
          <Input
            id="oldPassword"
            name="oldPassword"
            type="password"
            required
            className="w-full"
            placeholder={t("profile.changePassword.oldPasswordPlaceholder")}
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

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            loading={changePasswordMutation.isPending}
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending
              ? t("profile.changePassword.saving")
              : t("profile.changePassword.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
