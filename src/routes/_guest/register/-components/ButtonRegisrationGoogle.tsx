import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useGoogleRegisterMutation } from "../../-api/auth.query";
import Button from "../../../../components/ui/Button";
import Dialog from "../../../../components/ui/DIalog";
import Skeleton from "../../../../components/ui/Skeleton";
import Input from "../../../../components/ui/Input";
import toast from "../../../../components/ui/Toast";

interface Props {
  fieldName: "referralCode" | "inviteCode" | "inviteToken";
  inviteToken?: {
    invitedBy: string;
    invitedOrganizationId: string;
  };
}

function ButtonRegisrationGoogle({ fieldName, inviteToken }: Props) {
  const googleRegisterMutation = useGoogleRegisterMutation();
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState("");

  const isReferral = fieldName === "referralCode";
  const isInviteToken = fieldName === "inviteToken";

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Token Google tidak ditemukan.");
      return;
    }

    if (fieldName === "inviteToken" && !inviteToken) {
      toast.error("Token undangan tidak ditemukan.");
      return;
    }

    googleRegisterMutation.mutate({
      accountType: isReferral ? "INDIVIDUAL" : "ORGANIZATION",
      token: credentialResponse.credential,
      ...(inputValue.trim()
        ? fieldName === "referralCode"
          ? { referralCode: inputValue }
          : fieldName === "inviteCode"
            ? { inviteCode: inputValue }
            : {}
        : fieldName === "inviteToken" && inviteToken
          ? inviteToken
          : {}),
    });
  };

  const CustomGoogleButton = ({ onClick }: { onClick: () => void }) => (
    <Button
      type="button"
      color="white"
      onClick={onClick}
      disabled={googleRegisterMutation.isPending}
      className="w-full flex items-center justify-center gap-3 bg-bg-paper border border-divider text-text-primary hover:bg-divider/10"
      startIcon={
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.22 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.18C.43 8.12 0 9.83 0 12s.43 3.88 1.18 5.4l4.09-3.16z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.15 2.68 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
          />
        </svg>
      }
    >
      {googleRegisterMutation.isPending
        ? t("guest.register.processing", "Memproses...")
        : t("guest.register.googleButton", "Daftar dengan Google")}
    </Button>
  );

  if (isInviteToken) {
    return (
      <div className="relative">
        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 cursor-pointer">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Proses autentikasi Google digagalkan.")}
            text="signup_with"
          />
        </div>
        <CustomGoogleButton onClick={() => {}} />
      </div>
    );
  }

  return (
    <Dialog
      skeleton={<Skeleton height={44} width="100%" variant="rounded" />}
      trigger={(openDialog) => (
        <CustomGoogleButton onClick={() => openDialog()} />
      )}
      className="p-6"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary-main/10 text-primary-main mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 11-4 0 2 2 0 014 0zM19 12a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-text-primary">
            {t("guest.register.dialogTitle", "Satu Langkah Lagi")}
          </h3>
          <p className="text-sm text-text-secondary mt-1.5 px-4">
            {t(
              "guest.register.dialogSubtitle",
              "Punya kode undangan? Masukkan di bawah ini, atau langsung lanjutkan untuk menyelesaikan pendaftaran.",
            )}
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="flex text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 justify-between">
            <span>
              {t(
                isReferral
                  ? "guest.register.referralLabel"
                  : "guest.register.organizationNameLabel",
              )}
            </span>
            <span className="text-text-disabled">
              {t("guest.register.referralOptional")}
            </span>
          </label>
          <Input
            type="text"
            name={fieldName}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t("guest.register.referralPlaceholder")}
            className="w-full bg-transparent"
          />
        </div>

        <div className="w-full flex justify-center">
          <div className="min-w-60 w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                toast.error("Proses autentikasi Google digagalkan.")
              }
              shape="pill"
              text="continue_with"
              width="100%"
            />
          </div>
        </div>
        <span className="text-xs text-text-disabled text-center mt-2 max-w-xs">
          Dengan mendaftar, Anda menyetujui Syarat & Ketentuan serta Kebijakan
          Privasi kami.
        </span>
      </div>
    </Dialog>
  );
}

export default ButtonRegisrationGoogle;
