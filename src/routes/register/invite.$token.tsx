import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { apiFetch } from "../../src/utils/api";

export const Route = createFileRoute("/register/invite/$token")({
  component: RegisterInvite,
});

interface InviteTokenData {
  type: "inviteCode" | "directAdd";
  inviteCode?: string;
  invitedBy?: string;
  invitedOrganizationId?: string;
  invitationRole?: "member" | "admin";
}

interface RegisterFormData {
  email: string;
  password: string;
  fullName: string;
}

interface PasswordStrength {
  score: number;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

interface InvitationInfo {
  organizationName: string;
  inviterName: string;
  role: string;
  isValid: boolean;
  error?: string;
}

function RegisterInvite() {
  const { token } = Route.useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    fullName: "",
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
  });
  const [decodedToken, setDecodedToken] = useState<InviteTokenData | null>(
    null,
  );
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(
    null,
  );
  const [isLoadingToken, setIsLoadingToken] = useState(true);

  // Decode token saat komponen mount
  useEffect(() => {
    const decodeToken = async () => {
      try {
        // Coba decode sebagai base64 untuk direct add
        const decoded = atob(token);
        const tokenData: InviteTokenData = JSON.parse(decoded);

        // Validasi field yang diperlukan untuk direct add
        if (
          tokenData.invitedBy &&
          tokenData.invitedOrganizationId &&
          tokenData.invitationRole
        ) {
          setDecodedToken({
            ...tokenData,
            type: "directAdd",
          });

          // Simulasi info invitation (dalam real implementation, fetch dari API)
          setInvitationInfo({
            organizationName: "Organization (dari token)",
            inviterName: "User (dari token)",
            role: tokenData.invitationRole,
            isValid: true,
          });
        } else {
          throw new Error("Invalid token structure");
        }
      } catch (base64Error) {
        // Jika bukan base64, anggap sebagai inviteCode
        if (/^[A-Z0-9\-]{6,30}$/.test(token)) {
          setDecodedToken({
            type: "inviteCode",
            inviteCode: token,
          });

          setInvitationInfo({
            organizationName: "Organization (dari invite code)",
            inviterName: "System",
            role: "member",
            isValid: true,
          });
        } else {
          setInvitationInfo({
            organizationName: "",
            inviterName: "",
            role: "",
            isValid: false,
            error: "Token undangan tidak valid atau sudah kadaluarsa",
          });
        }
      } finally {
        setIsLoadingToken(false);
      }
    };

    decodeToken();
  }, [token]);

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
      if (!decodedToken) {
        throw new Error("Token undangan tidak valid");
      }

      const payload: Record<string, string> = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        accountType: "ORGANIZATION",
      };

      if (decodedToken.type === "inviteCode" && decodedToken.inviteCode) {
        payload.inviteCode = decodedToken.inviteCode;
      } else if (
        decodedToken.type === "directAdd" &&
        decodedToken.invitedBy &&
        decodedToken.invitedOrganizationId
      ) {
        payload.invitedBy = decodedToken.invitedBy;
        payload.invitedOrganizationId = decodedToken.invitedOrganizationId;
        payload.invitationRole = decodedToken.invitationRole || "member";
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

  // Loading state saat decode token
  if (isLoadingToken) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-bg-paper rounded-lg shadow-md border border-divider p-8 text-center">
          <div className="w-12 h-12 border-4 border-primary-main border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Memuat informasi undangan...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!invitationInfo?.isValid) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-bg-paper rounded-lg shadow-md border border-error-main p-8 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-error-main mb-2">
            Undangan Tidak Valid
          </h2>
          <p className="text-text-secondary mb-6">
            {invitationInfo?.error || "Token undangan tidak dikenali"}
          </p>
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">Kemungkinan penyebab:</p>
            <ul className="text-sm text-text-secondary text-left inline-block space-y-1">
              <li>• Token sudah kadaluarsa</li>
              <li>• Token sudah digunakan</li>
              <li>• URL tidak lengkap atau rusak</li>
            </ul>
          </div>
          <div className="mt-8">
            <Link
              to="/register"
              className="inline-block bg-primary-main text-primary-contrast px-6 py-2 rounded hover:bg-primary-dark transition"
            >
              Kembali ke Registrasi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-bg-paper rounded-lg shadow-md border border-divider p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">📬</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Terima Undangan
          </h2>
          <p className="text-sm text-text-secondary">
            Bergabung dengan organization
          </p>
        </div>

        {/* Invitation Info Card */}
        {invitationInfo && (
          <div className="mb-6 p-4 bg-primary-light/10 border border-primary-main/30 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-lg">🏢</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary-dark mb-2">
                  Anda diundang untuk bergabung!
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Organization:</span>
                    <span className="text-text-primary font-medium">
                      {invitationInfo.organizationName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Diundang oleh:</span>
                    <span className="text-text-primary font-medium">
                      {invitationInfo.inviterName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Role:</span>
                    <span className="text-text-primary font-medium capitalize">
                      {invitationInfo.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-6 p-4 bg-info-light/10 border border-info-main/30 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-lg">ℹ️</span>
            <div>
              <p className="text-sm text-info-dark font-medium mb-1">
                Akun Organization
              </p>
              <p className="text-xs text-text-secondary">
                Dengan menerima undangan ini, akun Anda akan otomatis menjadi
                bagian dari organization dengan role yang telah ditentukan.
              </p>
            </div>
          </div>
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
              placeholder="you@company.com"
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
              "Terima Undangan & Daftar"
            )}
          </button>
        </form>

        {/* Back Link */}
        <p className="text-xs text-text-secondary text-center mt-6">
          Salah undangan?{" "}
          <Link
            to="/register"
            className="text-primary-main hover:underline font-medium"
          >
            Kembali ke halaman registrasi
          </Link>
        </p>
      </div>
    </div>
  );
}
