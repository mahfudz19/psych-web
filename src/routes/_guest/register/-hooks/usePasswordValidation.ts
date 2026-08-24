import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  requirements: {
    minLength: boolean;
    maxLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
  };
}

interface UsePasswordValidationProps {
  password: string;
  confirmPassword: string;
}

interface UsePasswordValidationReturn {
  validation: PasswordValidationResult;
  passwordsMatch: boolean;
  canSubmit: boolean;
}

/**
 * Custom hook for real-time password validation.
 * Validates password against backend requirements and checks if passwords match.
 *
 * @param password - The main password value
 * @param confirmPassword - The confirmation password value
 * @returns Object containing validation result, match status, and submit eligibility
 */
export function usePasswordValidation({
  password,
  confirmPassword,
}: UsePasswordValidationProps): UsePasswordValidationReturn {
  const { t } = useTranslation();

  const validatePassword = useCallback(
    (pwd: string): PasswordValidationResult => {
      const requirements = {
        minLength: pwd.length >= 8,
        maxLength: pwd.length <= 100,
        hasUppercase: /[A-Z]/.test(pwd),
        hasLowercase: /[a-z]/.test(pwd),
        hasNumber: /[0-9]/.test(pwd),
      };

      const errors: string[] = [];

      if (!requirements.minLength) {
        errors.push(t("guest.register.passwordReqMinLength"));
      }
      if (!requirements.maxLength) {
        errors.push(t("guest.register.passwordReqMaxLength"));
      }
      if (!requirements.hasUppercase) {
        errors.push(t("guest.register.passwordReqUppercase"));
      }
      if (!requirements.hasLowercase) {
        errors.push(t("guest.register.passwordReqLowercase"));
      }
      if (!requirements.hasNumber) {
        errors.push(t("guest.register.passwordReqNumber"));
      }

      return {
        isValid: errors.length === 0,
        errors,
        requirements,
      };
    },
    [t],
  );

  const [validation, setValidation] = useState<PasswordValidationResult>(() =>
    validatePassword(password),
  );

  const passwordsMatch = password === confirmPassword && password.length > 0;

  useEffect(() => {
    const result = validatePassword(password);
    setValidation(result);
  }, [password, validatePassword]);

  const canSubmit = validation.isValid && passwordsMatch;

  return {
    validation,
    passwordsMatch,
    canSubmit,
  };
}
