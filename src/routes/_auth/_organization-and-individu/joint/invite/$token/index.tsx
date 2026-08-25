import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "../../../../../../components/ui/Toast";
import { authStore } from "../../../../../../utils/authStore";
import type { invitePayload } from "../../../../_organization/members/-components/ModalInvite";
import { useJoinOrganizationMutation } from "./-api/invite.query";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/joint/invite/$token/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [inviteData, setInviteData] = useState<invitePayload | null>(null);
  const [isTokenError, setIsTokenError] = useState(false);

  useEffect(() => {
    try {
      const decodedString = decodeURIComponent(escape(atob(token)));
      const parsedJson = JSON.parse(decodedString);
      setInviteData({ ...parsedJson });
    } catch (e) {
      setIsTokenError(true);
      toast.error(
        t("invite.invalid_token", "Tautan undangan tidak valid atau rusak"),
      );
    }
  }, [token, t]);

  const { mutateAsync, isPending } = useJoinOrganizationMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inviteData?.invitedOrganizationId) return;

    try {
      const { data } = await mutateAsync({
        orgId: inviteData?.invitedOrganizationId,
      });
      if (data) authStore.set({ user: data });

      toast.success(
        t("organization.join.success", "Berhasil bergabung dengan organisasi!"),
      );
      navigate({ to: "/dashboard", replace: true });
    } catch (error: any) {
      toast.error(
        error?.message ||
          t("organization.join.error", "Gagal bergabung dengan organisasi"),
      );
    }
  };

  // UI 1: JIKA TOKEN RUSAK (Empty / Error State Dashboard)
  if (isTokenError) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-bg-paper border border-error-main/20 rounded-3xl p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-error-main/10 text-error-main">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mb-3 text-2xl font-extrabold text-text-primary tracking-tight">
            Undangan Tidak Valid
          </h2>
          <p className="mb-8 text-text-secondary leading-relaxed">
            Tautan undangan yang Anda ikuti sepertinya sudah rusak, kedaluwarsa,
            atau tidak valid. Silakan minta tautan baru kepada pengundang Anda.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex justify-center rounded-2xl bg-transparent border border-divider px-6 py-3 text-sm font-bold text-text-primary hover:bg-divider/20 transition-all"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // UI 2: LOADING STATE
  if (!inviteData) {
    return (
      <div className="flex mt-20 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-divider border-t-primary-main"></div>
      </div>
    );
  }

  // UI 3: UNDANGAN ORGANISASI (Native Page Content)
  return (
    <div className="max-w-3xl mx-auto mt-8 sm:mt-12 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-bg-paper border border-divider rounded-4xl shadow-sm overflow-hidden relative">
        {/* Aksen Visual Latar Belakang (Opsional, agar tidak terlalu polos) */}
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-primary-main/5 to-transparent pointer-events-none"></div>

        <div className="px-6 py-10 sm:p-14 text-center relative z-10">
          {/* Ikon Organisasi dengan Pulse Effect */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-primary-main/20 rounded-2xl animate-pulse"></div>
            <div className="relative flex items-center justify-center w-full h-full bg-primary-main/10 text-primary-main rounded-2xl border-4 border-bg-paper shadow-sm">
              <svg
                className="w-9 h-9"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight mb-4">
            Undangan Kolaborasi
          </h2>

          <p className="text-text-secondary text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            <strong className="text-text-primary font-extrabold">
              {inviteData.invitedName}
            </strong>{" "}
            telah mengundang Anda untuk bergabung dan berkolaborasi di dalam
            ruang kerja{" "}
            <strong className="text-primary-main font-extrabold">
              {inviteData.invitedOrganizationName}
            </strong>
            .
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto"
          >
            {/* Tombol Tolak / Nanti Saja */}
            <Link
              to="/dashboard"
              className="w-full sm:w-1/2 flex items-center justify-center px-6 py-3.5 rounded-2xl border border-divider bg-transparent text-sm text-text-primary font-bold hover:bg-divider/20 transition-all focus:ring-2 focus:ring-divider outline-none"
            >
              Nanti Saja
            </Link>

            {/* Tombol Terima */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-1/2 flex items-center justify-center px-6 py-3.5 rounded-2xl bg-primary-main text-primary-contrast text-sm font-bold hover:bg-primary-dark transition-all shadow-md shadow-primary-main/20 disabled:opacity-70 focus:ring-2 focus:ring-primary-main/50 outline-none"
            >
              {isPending ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
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
                  Memproses...
                </>
              ) : (
                "Terima Undangan"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
