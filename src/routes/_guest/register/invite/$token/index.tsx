// src/routes/_guest/register/invite/$token/index.tsx
import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../../../utils/api";
import { AuthSplitLayout } from "../../../components/AuthSplitLayout";

export const Route = createFileRoute("/_guest/register/invite/$token/")({
  component: RegisterInvite,
});

/**
 * Komponen halaman registrasi untuk undangan organisasi.
 * @param token - Token undangan dari URL parameter
 */
function RegisterInvite() {
  const { t } = useTranslation();
  const devMode = false;

  const { token } = Route.useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [inviteData, setInviteData] = useState<any>(null);

  // Logika untuk menentukan jenis token saat komponen dimuat
  useEffect(() => {
    try {
      // Opsi B: Mencoba decode Base64 (Token Direct Add)
      const decodedString = atob(token);
      const parsedJson = JSON.parse(decodedString);
      setInviteData({ type: "DIRECT_ADD", payload: parsedJson });
    } catch (e) {
      // Opsi A: Gagal decode, berarti ini Invite Code biasa (String murni)
      setInviteData({ type: "INVITE_CODE", payload: { inviteCode: token } });
    }
  }, [token]);

  const registerMutation = useMutation({
    mutationFn: () => {
      // Merakit payload sesuai dengan jenis token yang terdeteksi
      const bodyPayload = {
        ...formData,
        accountType: "ORGANIZATION",
        ...(inviteData?.type === "DIRECT_ADD"
          ? inviteData.payload
          : { inviteCode: token }),
      };

      return api("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(bodyPayload),
      });
    },
    onSuccess: () => {
      alert("Berhasil bergabung dengan organisasi! Silakan login.");
      router.navigate({ to: "/login" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <AuthSplitLayout layoutKey="registerInvite" imagePosition="right">
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-info-main text-info-contrast font-black text-xs tracking-widest rounded mb-6">
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
      <div className="mb-6 p-4 bg-info-main/10 border border-info-light/30 rounded-xl flex flex-col gap-1">
        <span className="text-info-dark text-xs font-bold uppercase tracking-wider">
          {t("guest.invite.statusLabel")}
        </span>
        <span className="text-info-main text-sm font-medium">
          {inviteData?.type === "DIRECT_ADD"
            ? t("guest.invite.statusDirectAdd", {
                role: inviteData.payload.invitationRole,
              })
            : t("guest.invite.statusInviteCode")}
        </span>
      </div>

      {registerMutation.isError && (
        <div className="mb-6 p-3.5 bg-error-main/10 border-l-4 border-error-main rounded-r-md">
          <p className="text-error-main text-xs font-semibold">
            {t("guest.invite.error")}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            {t("guest.invite.fullNameLabel")}
          </label>
          <input
            type="text"
            placeholder={t("guest.invite.fullNamePlaceholder")}
            required
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            {t("guest.invite.emailLabel")}
          </label>
          <input
            type="email"
            placeholder={t("guest.invite.emailPlaceholder")}
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            {t("guest.invite.passwordLabel")}
          </label>
          <input
            type="password"
            placeholder={t("guest.invite.passwordPlaceholder")}
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-xl border border-divider bg-bg-default text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all text-sm font-medium"
          />
        </div>

        {devMode && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
              Data Registrasi (Otomatis)
            </label>
            <textarea
              value={
                inviteData?.type === "DIRECT_ADD"
                  ? JSON.stringify(inviteData.payload, null, 2)
                  : token
              }
              disabled
              rows={inviteData?.type === "DIRECT_ADD" ? 4 : 1}
              className="w-full px-4 py-2.5 rounded-xl border border-divider bg-divider/20 text-text-secondary cursor-not-allowed text-sm font-mono resize-none"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={registerMutation.isPending || !inviteData}
          className="w-full mt-4 py-3 px-4 bg-primary-main text-primary-contrast rounded-xl font-bold text-sm hover:bg-primary-dark active:scale-[0.99] focus:outline-none disabled:opacity-50 transition-all shadow-md shadow-primary-main/20"
        >
          {registerMutation.isPending
            ? t("guest.invite.processing")
            : t("guest.invite.submitBtn")}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-divider text-left text-sm text-text-secondary">
        {t("guest.invite.hasAccount")}{" "}
        <Link
          to="/login"
          className="text-primary-main font-bold hover:underline"
        >
          {t("guest.invite.loginLink")}
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
