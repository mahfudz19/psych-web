import { useTranslation } from "react-i18next";
import PassworfField from "../../-components/PassworfField";
import Tooltip from "../../../../components/ui/Tooltip";
import useMediaQuery from "../../../../components/utility/useMediaQuery";

export const requirements = (password: string) => {
  return {
    minLength: password.length >= 8,
    maxLength: password.length > 0 && password.length <= 100,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
};

interface PasswordFieldsProps {
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  requirements: Record<string, boolean>;
  passwordsMatch: boolean;
}

export default function PasswordFields({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  requirements,
  passwordsMatch,
}: PasswordFieldsProps) {
  const { t } = useTranslation();

  const sm = !useMediaQuery("sm");

  const listRequirements = [
    { key: "minLength", lable: t("guest.register.passwordReqMinLength") },
    { key: "maxLength", lable: t("guest.register.passwordReqMaxLength") },
    { key: "hasUppercase", lable: t("guest.register.passwordReqUppercase") },
    { key: "hasLowercase", lable: t("guest.register.passwordReqLowercase") },
    { key: "hasNumber", lable: t("guest.register.passwordReqNumber") },
  ];

  const unfulfilledRequirements =
    password.length > 0
      ? listRequirements.filter(({ key }) => !requirements[key])
      : [];

  return (
    <>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
          {t("guest.register.passwordLabel")}
        </label>

        <Tooltip
          position={sm ? "top-center" : "right-center"}
          classNames={{ trigger: "w-full" }}
          trigger={
            <>
              <PassworfField
                name="password"
                placeholder={t("guest.register.passwordPlaceholder")}
                required
                value={password}
                className="w-full!"
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          }
        >
          <div className="w-full min-w-70 p-2">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
              {t("guest.register.passwordRequirements")}
            </p>
            <ul className="space-y-2">
              {listRequirements.map(({ key, lable }) => (
                <li
                  key={key}
                  className={`text-xs flex items-center gap-2 transition-colors ${
                    requirements[key]
                      ? "text-success-main font-medium"
                      : "text-text-disabled"
                  }`}
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    {requirements[key] ? "✓" : "○"}
                  </span>
                  {lable}
                </li>
              ))}
            </ul>
          </div>
        </Tooltip>
        {unfulfilledRequirements.length > 0 && (
          <>
            {unfulfilledRequirements.map(({ key, lable }) => (
              <span key={key} className="text-xs font-medium text-error-main">
                {lable}
                {unfulfilledRequirements.length > 1 && "; "}
              </span>
            ))}
          </>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
          {t("guest.register.confirmPasswordLabel")}
        </label>
        <PassworfField
          name="confirmPassword"
          placeholder={t("guest.register.confirmPasswordPlaceholder")}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="mt-1.5 text-xs font-medium text-error-main">
            {t("guest.register.passwordMismatch")}
          </p>
        )}
      </div>
    </>
  );
}
