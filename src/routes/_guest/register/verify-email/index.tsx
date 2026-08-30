import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  useResendVerifyEmailMutation,
  useVerifyEmailMutation,
} from "../../-api/auth.query";
import Button from "../../../../components/ui/Button";
import toast from "../../../../components/ui/Toast";

// 1. Validasi Search Params agar dikenali oleh TypeScript
export const Route = createFileRoute("/_guest/register/verify-email/")({
  validateSearch: (search: Record<string, string | undefined>) => ({
    email: search.email,
    token: search.token,
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { t } = useTranslation();
  const { email, token } = Route.useSearch();

  const verifyMutation = useVerifyEmailMutation();

  const hasAttempted = useRef(false);

  useEffect(() => {
    if (email && token && !hasAttempted.current) {
      verifyMutation.mutate({ email, plainToken: token });
    }
  }, []);

  const isInvalidUrl = !email || !token;

  return (
    <div className="flex flex-col items-center justify-center text-center py-8 animate-in zoom-in-95 fade-in duration-500">
      {isInvalidUrl && (
        <>
          <div className="w-20 h-20 bg-warning-main/10 text-warning-main rounded-full flex items-center justify-center mb-6 border-4 border-warning-main/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-extrabold text-text-primary mb-3">
            {t("guest.verifyEmail.invalidLinkTitle")}
          </h3>
          <p className="text-text-secondary text-sm mb-8">
            {t("guest.verifyEmail.invalidLinkMessage")}
          </p>
          <Link to="/login" className="w-full">
            <Button type="button" className="w-full">
              {t("guest.verifyEmail.backToLogin")}
            </Button>
          </Link>
        </>
      )}

      {!isInvalidUrl && verifyMutation.isPending && (
        <>
          <div className="w-20 h-20 bg-primary-main/10 text-primary-main rounded-full flex items-center justify-center mb-6 border-4 border-primary-main/20">
            <svg
              className="animate-spin h-8 w-8 text-primary-main"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h3 className="text-2xl font-extrabold text-text-primary mb-3">
            {t("guest.verifyEmail.verifyingTitle")}
          </h3>
          <p className="text-text-secondary text-sm">
            {t("guest.verifyEmail.verifyingMessage")}
          </p>
        </>
      )}

      {!isInvalidUrl && verifyMutation.isSuccess && (
        <>
          <div className="w-20 h-20 bg-success-main/10 text-success-main rounded-full flex items-center justify-center mb-6 border-4 border-success-main/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-extrabold text-text-primary mb-3">
            {t("guest.verifyEmail.successTitle")}
          </h3>
          <p className="text-text-secondary text-sm mb-6">
            {t("guest.verifyEmail.successMessage")}
          </p>
          {/* Navigasi otomatis sudah di-handle oleh onSuccess di auth.query.ts */}
        </>
      )}

      {!isInvalidUrl && verifyMutation.isError && (
        <>
          <div className="w-20 h-20 bg-error-main/10 text-error-main rounded-full flex items-center justify-center mb-6 border-4 border-error-main/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-extrabold text-text-primary mb-3">
            {t("guest.verifyEmail.failedTitle")}
          </h3>
          <p className="text-text-secondary text-sm mb-8">
            {t("guest.verifyEmail.failedMessage")}
          </p>

          <ResendMutation email={email} />
        </>
      )}
    </div>
  );
}

const ResendMutation = ({ email }: { email?: string }) => {
  const { t } = useTranslation();
  const resendMutation = useResendVerifyEmailMutation();
  const handleResend = () =>
    email
      ? resendMutation.mutate(email)
      : toast.error(t("guest.verifyEmail.resendError"));

  return (
    <>
      <div className="w-full flex flex-col gap-3">
        <Button
          onClick={handleResend}
          disabled={resendMutation.isPending}
          className="w-full shadow-md shadow-primary-main/20"
        >
          {resendMutation.isPending
            ? t("guest.verifyEmail.resendSending")
            : resendMutation.isSuccess
              ? t("guest.verifyEmail.resendSuccess")
              : t("guest.verifyEmail.resendButton")}
        </Button>

        <Link to="/login" className="w-full block">
          <Button
            type="button"
            className="w-full bg-transparent border border-divider text-text-primary hover:bg-divider/10"
          >
            {t("guest.verifyEmail.backToLogin")}
          </Button>
        </Link>
      </div>

      {resendMutation.isSuccess && (
        <div className="mt-6 p-3 bg-success-main/10 border border-success-main/20 rounded-xl">
          <p
            className="text-xs text-success-main font-medium leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: t("guest.verifyEmail.resendNote", { email }),
            }}
          />
        </div>
      )}
    </>
  );
};
