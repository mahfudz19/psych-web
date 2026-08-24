import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AuthSplitLayout } from "../-components/AuthSplitLayout";
import PassworfField from "../-components/PassworfField";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useRegisterMutation } from "../-api/auth.query";
import { useState } from "react";
import { usePasswordValidation } from "./-hooks/usePasswordValidation";

export const Route = createFileRoute("/_guest/register/")({
  component: RegisterIndividual,
});

function RegisterIndividual() {
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // STATE: Kontrol UI progresif
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showReferral, setShowReferral] = useState(false);

  // STATE BARU: Kontrol halaman sukses verifikasi
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const registerMutation = useRegisterMutation();
  const { validation, passwordsMatch, canSubmit } = usePasswordValidation({
    password,
    confirmPassword,
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const fullName = formData.get("fullName") as string;
    const referralCode = showReferral
      ? (formData.get("referralCode") as string)
      : "";

    // Tambahkan callback onSuccess di sini untuk memicu perubahan UI
    registerMutation.mutate(
      {
        email,
        password,
        fullName,
        referralCode,
        accountType: "INDIVIDUAL",
      },
      {
        onSuccess: () => {
          setSubmittedEmail(email); // Simpan email untuk ditampilkan
          setIsSuccess(true); // Ganti UI ke mode sukses
        },
      },
    );
  };

  return (
    <AuthSplitLayout layoutKey="registerIndividual" imagePosition="right">
      {!isSuccess ? (
        // ==========================================
        // UI 1: FORM REGISTRASI
        // ==========================================
        <div className="animate-in fade-in duration-500">
          <div className="mb-8">
            <h3 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
              {t("guest.register.title")}
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              {t("guest.register.subtitle")}
            </p>

            {/* TAB TOGGLE */}
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

            {/* PASSWORD FIELD WITH FLOATING INFO */}
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                {t("guest.register.passwordLabel")}
              </label>
              <div
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              >
                <PassworfField
                  name="password"
                  placeholder={t("guest.register.passwordPlaceholder")}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* FLOATING PASSWORD REQUIREMENTS */}
              <div
                className={`absolute left-0 top-full mt-2 w-full p-4 rounded-xl bg-bg-paper border border-divider shadow-xl z-50 transition-all duration-300 pointer-events-none origin-top ${
                  isPasswordFocused
                    ? "opacity-100 scale-y-100"
                    : "opacity-0 scale-y-95 hidden"
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                  {t("guest.register.passwordRequirements")}
                </p>
                <ul className="space-y-2">
                  <li
                    className={`text-xs flex items-center gap-2 transition-colors ${validation.requirements.minLength ? "text-success-main font-medium" : "text-text-disabled"}`}
                  >
                    <span className="w-4 h-4 flex items-center justify-center">
                      {validation.requirements.minLength ? "✓" : "○"}
                    </span>
                    {t("guest.register.passwordReqMinLength")}
                  </li>
                  <li
                    className={`text-xs flex items-center gap-2 transition-colors ${validation.requirements.maxLength ? "text-success-main font-medium" : "text-text-disabled"}`}
                  >
                    <span className="w-4 h-4 flex items-center justify-center">
                      {validation.requirements.maxLength ? "✓" : "○"}
                    </span>
                    {t("guest.register.passwordReqMaxLength")}
                  </li>
                  <li
                    className={`text-xs flex items-center gap-2 transition-colors ${validation.requirements.hasUppercase ? "text-success-main font-medium" : "text-text-disabled"}`}
                  >
                    <span className="w-4 h-4 flex items-center justify-center">
                      {validation.requirements.hasUppercase ? "✓" : "○"}
                    </span>
                    {t("guest.register.passwordReqUppercase")}
                  </li>
                  <li
                    className={`text-xs flex items-center gap-2 transition-colors ${validation.requirements.hasLowercase ? "text-success-main font-medium" : "text-text-disabled"}`}
                  >
                    <span className="w-4 h-4 flex items-center justify-center">
                      {validation.requirements.hasLowercase ? "✓" : "○"}
                    </span>
                    {t("guest.register.passwordReqLowercase")}
                  </li>
                  <li
                    className={`text-xs flex items-center gap-2 transition-colors ${validation.requirements.hasNumber ? "text-success-main font-medium" : "text-text-disabled"}`}
                  >
                    <span className="w-4 h-4 flex items-center justify-center">
                      {validation.requirements.hasNumber ? "✓" : "○"}
                    </span>
                    {t("guest.register.passwordReqNumber")}
                  </li>
                </ul>
              </div>
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

            <div className="pt-1">
              {!showReferral ? (
                <button
                  type="button"
                  onClick={() => setShowReferral(true)}
                  className="text-sm font-bold text-primary-main hover:text-primary-dark hover:underline transition-all flex items-center gap-1"
                >
                  +{" "}
                  {t(
                    "guest.register.addReferral",
                    "Add Referral Code (Optional)",
                  )}
                </button>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="flex text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 justify-between">
                    <span>{t("guest.register.referralLabel")}</span>
                    <button
                      type="button"
                      onClick={() => setShowReferral(false)}
                      className="text-error-main hover:underline normal-case"
                    >
                      {t("common.cancel", "Cancel")}
                    </button>
                  </label>
                  <Input
                    type="text"
                    name="referralCode"
                    placeholder={t("guest.register.referralPlaceholder")}
                    className="w-full px-4 py-2.5 rounded-2xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium uppercase"
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="mt-2"
              disabled={registerMutation.isPending || !canSubmit}
            >
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
        // ==========================================
        // UI 2: HALAMAN SUKSES (CEK EMAIL)
        // ==========================================
        <div className="flex flex-col items-center justify-center text-center py-12 animate-in zoom-in-95 fade-in duration-500">
          {/* Ikon Surat/Email */}
          <div className="w-20 h-20 bg-primary-main/10 text-primary-main rounded-full flex items-center justify-center mb-6 border-4 border-primary-main/20">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h3 className="text-3xl font-extrabold text-text-primary tracking-tight mb-4">
            {t("guest.register.checkEmailTitle", "Periksa Email Anda")}
          </h3>

          <p className="text-text-secondary text-base mb-8 leading-relaxed max-w-sm">
            {t(
              "guest.register.checkEmailDesc",
              "Kami telah mengirimkan tautan verifikasi ke email",
            )}{" "}
            <span className="font-bold text-text-primary block mt-1">
              {submittedEmail}
            </span>
          </p>

          <div className="w-full p-4 bg-warning-main/10 rounded-2xl border border-warning-main/20 mb-8 text-left">
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-warning-dark mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-warning-dark font-medium leading-relaxed">
                {t(
                  "guest.register.spamNotice",
                  "Tidak menerima email? Pastikan alamat email sudah benar dan periksa folder Spam atau Promosi Anda.",
                )}
              </p>
            </div>
          </div>

          <Link to="/login" className="w-full block">
            <Button type="button" className="w-full">
              {t("guest.register.backToLogin", "Kembali ke Login")}
            </Button>
          </Link>
        </div>
      )}
    </AuthSplitLayout>
  );
}
