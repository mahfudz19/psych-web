import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "../../src/utils/api";

export const Route = createFileRoute("/register/individual")({
  component: RegisterIndividual,
});

interface RegisterFormData {
  email: string;
  password: string;
  fullName: string;
  referralCode?: string;
}

interface PasswordStrength {
  score: number;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

function RegisterIndividual() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    fullName: "",
    referralCode: "",
  });
  const [showReferral, setShowReferral] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
  });

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const strength = {
      score: 0,
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };

    if (strength.hasMinLength) strength.score++;
    if (strength.hasUppercase) strength.score++;
    if (strength.hasLowercase) strength.score++;
    if (strength.hasNumber) strength.score++;

    return strength;
  };

  const handlePasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, password: value }));
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const registerMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, string> = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        accountType: "INDIVIDUAL",
      };

      if (formData.referralCode) {
        payload.referralCode = formData.referralCode;
      }

      return apiFetch("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      // Simpan token dan user data
      localStorage.setItem("authToken", data.data.token);
      localStorage.setItem("userProfile", JSON.stringify(data.data.user));

      // Redirect ke dashboard
      router.invalidate().then(() => {
        router.navigate({ to: "/dashboard" });
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName) return;
    registerMutation.mutate();
  };

  const getStrengthColor = (score: number) => {
    if (score <= 1) return "bg-error-main";
    if (score <= 2) return "bg-warning-main";
    if (score <= 3) return "bg-info-main";
    return "bg-success-main";
  };

  const getStrengthText = (score: number) => {
    if (score <= 1) return "Sangat Lemah";
    if (score <= 2) return "Lemah";
    if (score <= 3) return "Cukup";
    return "Kuat";
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-bg-paper rounded-lg shadow-md border border-divider p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">👤</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Akun Individual
          </h2>
          <p className="text-sm text-text-secondary">
            Buat akun untuk penggunaan pribadi
          </p>
        </div>

        {/* Error Display */}
        {registerMutation.isError && (
          <div className="mb-6 p-4 bg-error-main/10 border border-error-main rounded-lg">
            <p className="text-sm text-error-dark">
              {registerMutation.error.message}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fullName: e.target.value }))
              }
              disabled={registerMutation.isPending}
              className="px-3 py-2 bg-bg-default border border-divider rounded focus:outline-none focus:border-primary-main text-text-primary transition disabled:opacity-50"
              placeholder="John Doe"
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              disabled={registerMutation.isPending}
              className="px-3 py-2 bg-bg-default border border-divider rounded focus:outline-none focus:border-primary-main text-text-primary transition disabled:opacity-50"
              placeholder="user@example.com"
              required
              maxLength={255}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              disabled={registerMutation.isPending}
              className="px-3 py-2 bg-bg-default border border-divider rounded focus:outline-none focus:border-primary-main text-text-primary transition disabled:opacity-50"
              placeholder="••••••••"
              required
              minLength={8}
              maxLength={100}
            />

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded transition-all ${
                        index < passwordStrength.score
                          ? getStrengthColor(passwordStrength.score)
                          : "bg-divider"
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`text-xs ${getStrengthColor(passwordStrength.score).replace("bg-", "text-")}`}
                >
                  Kekuatan: {getStrengthText(passwordStrength.score)}
                </p>
                <ul className="mt-2 space-y-1 text-xs text-text-secondary">
                  <li
                    className={
                      passwordStrength.hasMinLength ? "text-success-main" : ""
                    }
                  >
                    {passwordStrength.hasMinLength ? "✓" : "○"} Minimal 8
                    karakter
                  </li>
                  <li
                    className={
                      passwordStrength.hasUppercase ? "text-success-main" : ""
                    }
                  >
                    {passwordStrength.hasUppercase ? "✓" : "○"} Huruf uppercase
                  </li>
                  <li
                    className={
                      passwordStrength.hasLowercase ? "text-success-main" : ""
                    }
                  >
                    {passwordStrength.hasLowercase ? "✓" : "○"} Huruf lowercase
                  </li>
                  <li
                    className={
                      passwordStrength.hasNumber ? "text-success-main" : ""
                    }
                  >
                    {passwordStrength.hasNumber ? "✓" : "○"} Angka
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Referral Code Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowReferral(!showReferral)}
              className="text-sm text-primary-main hover:text-primary-dark transition font-medium"
            >
              {showReferral ? "❌" : "+"} Punya kode referral?{" "}
              {showReferral ? "Tutup" : "(Opsional)"}
            </button>
          </div>

          {/* Referral Code Input */}
          {showReferral && (
            <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-sm font-medium text-text-primary">
                Kode Referral
              </label>
              <input
                type="text"
                value={formData.referralCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    referralCode: e.target.value.toUpperCase(),
                  }))
                }
                disabled={registerMutation.isPending}
                className="px-3 py-2 bg-bg-default border border-divider rounded focus:outline-none focus:border-primary-main text-text-primary transition disabled:opacity-50 uppercase tracking-wider"
                placeholder="ABC123"
                pattern="[A-Z0-9]{6,20}"
                maxLength={20}
              />
              <p className="text-xs text-text-secondary">
                6-20 karakter uppercase alphanumeric
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              registerMutation.isPending ||
              !formData.email ||
              !formData.password ||
              !formData.fullName
            }
            className="w-full mt-6 bg-primary-main text-primary-contrast font-medium py-3 px-4 rounded hover:bg-primary-dark transition disabled:bg-primary-light disabled:cursor-not-allowed flex justify-center items-center h-11"
          >
            {registerMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Buat Akun Individual"
            )}
          </button>
        </form>

        {/* Terms */}
        <p className="text-xs text-text-secondary text-center mt-6">
          Dengan mendaftar, Anda menyetujui{" "}
          <a href="#" className="text-primary-main hover:underline">
            Terms of Service
          </a>{" "}
          dan{" "}
          <a href="#" className="text-primary-main hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
