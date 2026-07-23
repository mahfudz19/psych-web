import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../../hooks/useAuth";
import {
  useReferralStatsQuery,
  useRegenerateMutation,
} from "./-api/referral.query";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/profile/referral/",
)({
  component: ReferralPage,
});

export function ReferralPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Fetch referral stats from backend (optional - will use user profile as fallback)
  const { data: statsData, isLoading: isLoadingStats } =
    useReferralStatsQuery();

  // Regenerate mutation
  const regenerateMutation = useRegenerateMutation();

  const [copied, setCopied] = useState(false);

  // Get stats - prioritize backend data, fallback to user profile
  const stats = statsData?.data?.stats;
  const totalReferred = stats?.totalReferred ?? user?.totalReferrals ?? 0;
  const referralEarnings =
    stats?.referralEarnings ?? user?.referralEarnings ?? 0;
  // Get active code from user profile (primary source)
  const activeCode = user?.referralCode ?? "";

  // Format rewards display
  const activeRewards =
    referralEarnings > 0
      ? `Rp ${referralEarnings.toLocaleString("id-ID")}`
      : t("referral.stats.noRewards");

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const handleRegenerate = () => {
    if (window.confirm(t("referral.regenerateConfirm"))) {
      regenerateMutation.mutate({ reason: "user_request" });
    }
  };

  // Loading state
  if (isLoadingStats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-5 rounded-3xl bg-bg-paper border border-divider shadow-sm animate-pulse">
            <div className="h-4 bg-divider rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-divider rounded w-1/2"></div>
          </div>
          <div className="p-5 rounded-3xl bg-bg-paper border border-divider shadow-sm animate-pulse">
            <div className="h-4 bg-divider rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-divider rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Kolom 1-2: Kode Aktif */}
      <div className="md:col-span-2 p-5 rounded-3xl bg-bg-paper border border-divider shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <span className="text-[11px] font-bold text-primary-main uppercase tracking-wider">
            {t("referral.activeCodeLabel")}
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-black font-mono tracking-wide text-text-primary bg-bg-default px-3 py-1.5 rounded-xl border border-divider">
              {activeCode || "-"}
            </span>
            {activeCode && (
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-main text-primary-contrast hover:opacity-95 transition-all shadow-sm"
              >
                {copied ? t("referral.copiedButton") : t("referral.copyButton")}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-divider">
          <span className="text-[11px] text-text-disabled">
            {t("referral.compatibilityNote")}
          </span>
          <button
            onClick={handleRegenerate}
            disabled={regenerateMutation.isPending}
            className="text-xs font-bold text-warning-main hover:underline disabled:opacity-50"
          >
            {regenerateMutation.isPending
              ? t("referral.regeneratingButton")
              : t("referral.regenerateButton")}
          </button>
        </div>
      </div>

      {/* Kolom 3: Statistik Singkat */}
      <div className="p-5 rounded-3xl bg-bg-paper border border-divider shadow-sm flex flex-col justify-between space-y-3">
        <div>
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            {t("referral.stats.totalReferredLabel")}
          </p>
          <p className="text-xl font-extrabold text-text-primary mt-0.5">
            {totalReferred}{" "}
            <span className="text-xs font-normal text-text-secondary">
              {t("referral.stats.peopleSuffix")}
            </span>
          </p>
        </div>
        <div className="pt-2 border-t border-divider">
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            {t("referral.stats.rewardsLabel")}
          </p>
          <p className="text-xs font-bold text-success-main mt-0.5 truncate">
            {activeRewards}
          </p>
        </div>
      </div>
    </div>
  );
}
