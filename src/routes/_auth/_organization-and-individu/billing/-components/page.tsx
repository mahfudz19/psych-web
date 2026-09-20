import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useCheckout,
  useGetSubscriptionPlans,
  useGetTransaction,
} from "../-api/billing.query";
import Alert from "../../../../../components/ui/Alert";
import AlertDescription from "../../../../../components/ui/Alert/AlertDescription";
import AlertTitle from "../../../../../components/ui/Alert/AlertTitle";
import Button from "../../../../../components/ui/Button";
import Skeleton from "../../../../../components/ui/Skeleton";
import toast from "../../../../../components/ui/Toast";

function BillingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [activePlanCode, setActivePlanCode] = useState<string | null>(null);

  // 1. Fetch daftar paket
  const {
    data: plansRes,
    isLoading: isLoadingPlans,
    error: plansError,
  } = useGetSubscriptionPlans();

  // 2. Mutasi checkout
  const { mutate: doCheckout, isPending: isCheckingOut } = useCheckout();

  // 3. Polling transaksi
  const { data: txRes } = useGetTransaction(referenceId || "", {
    enabled: !!referenceId,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (status === "PAID" || status === "EXPIRED" || status === "FAILED") {
        return false;
      }
      return 5000;
    },
  });

  const handleBuy = (planCode: string) => {
    setActivePlanCode(planCode);
    doCheckout(
      { planCode },
      {
        onSuccess: (res) => {
          if (res.data?.referenceId) {
            setReferenceId(res.data.referenceId);
            toast.success(
              t("billing.checkoutSuccess", "Tagihan berhasil dibuat!"),
            );
          }
        },
        onSettled: () => {
          setActivePlanCode(null);
        },
      },
    );
  };

  const txStatus = txRes?.data?.status;

  // -------------------------------------------------------------
  // STATE 1: Pembayaran Berhasil (Paid)
  // -------------------------------------------------------------
  if (txStatus === "PAID") {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="bg-bg-paper border border-divider rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-lg space-y-6">
          <div className="w-20 h-20 bg-success-main/10 text-success-main rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              {t("billing.successTitle", "Pembayaran Berhasil!")}
            </h2>
            <p className="text-text-secondary mt-2 text-sm md:text-base leading-relaxed">
              {t(
                "billing.successDesc",
                "Terima kasih. Paket langganan Anda telah diaktifkan secara otomatis.",
              )}
            </p>
          </div>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate({ to: "/dashboard" })}
          >
            {t("billing.goToDashboard", "Ke Dashboard")}
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 2: Menunggu Pembayaran (Pending)
  // -------------------------------------------------------------
  if (referenceId && txRes?.data) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-bg-paper border border-divider rounded-3xl p-6 md:p-10 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-2 bg-warning-main/10 text-warning-main px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase animate-pulse">
              <Clock className="w-4 h-4" />
              {t("billing.pendingStatus", "Menunggu Pembayaran")}
            </span>
            <h2 className="text-2xl font-extrabold text-text-primary">
              {t("billing.completePayment", "Selesaikan Pembayaran")}
            </h2>
            <p className="text-text-secondary text-sm">
              {t("billing.referenceLabel", "Kode Referensi:")}{" "}
              <code className="font-mono bg-bg-default px-2 py-1 rounded text-text-primary font-bold">
                {txRes.data.referenceId}
              </code>
            </p>
          </div>

          <Alert severity="info" variant="outlined">
            <AlertTitle>
              {t("billing.paymentNoticeTitle", "Instruksi Pembayaran")}
            </AlertTitle>
            <AlertDescription>
              {t(
                "billing.paymentNoticeDesc",
                "Silakan selesaikan transaksi melalui link pembayaran Xendit di bawah ini. Sistem akan mendeteksi status pembayaran secara otomatis.",
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-3 pt-2">
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => {
                if (txRes?.data?.checkoutUrl) {
                  window.open(
                    txRes.data.checkoutUrl,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }
              }}
              endIcon={<ExternalLink className="w-4 h-4" />}
            >
              {t("billing.openCheckoutUrl", "Buka Halaman Pembayaran Xendit")}
            </Button>
            <Button
              variant="outlined"
              color="white"
              fullWidth
              onClick={() => setReferenceId(null)}
            >
              {t("billing.cancelPayment", "Pilih Paket Lain")}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-text-secondary pt-4 border-t border-divider">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary-main" />
            <span>
              {t(
                "billing.autoPolling",
                "Mengecek status pembayaran secara otomatis...",
              )}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 3: Akses Ditolak (Error 403 Forbidden untuk Member)
  // -------------------------------------------------------------
  if (plansError) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="bg-bg-paper border border-divider rounded-3xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-error-main/10 text-error-main rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-2">
              {t("billing.accessDeniedTitle", "Akses Terbatas")}
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              {t(
                "billing.accessDeniedDesc",
                "Halaman langganan hanya dapat diakses oleh Pemilik (Owner) atau Administrator organisasi.",
              )}
            </p>
          </div>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate({ to: "/dashboard" })}
          >
            {t("common.backToDashboard", "Kembali ke Dashboard")}
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 4: Storefront (Daftar Paket)
  // -------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto py-6 px-4 md:px-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-main/10 text-primary-main">
          <Sparkles className="w-3.5 h-3.5" />
          {t("billing.badge", "Langganan & Tagihan")}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
          {t("billing.title", "Pilih Paket yang Sesuai")}
        </h1>
        <p className="text-text-secondary text-sm md:text-base leading-relaxed">
          {t(
            "billing.subtitle",
            "Tingkatkan produktivitas tim Anda dengan akses penuh ke seluruh fitur platform kami.",
          )}
        </p>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-text-secondary border-y border-divider py-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-success-main" />
          <span>{t("billing.securePayment", "Pembayaran Aman SSL")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-info-main" />
          <span>{t("billing.instantActivation", "Aktivasi Instan")}</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-warning-main" />
          <span>{t("billing.noHiddenFees", "Tanpa Biaya Tersembunyi")}</span>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoadingPlans ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              height={380}
              variant="rounded"
              className="w-full rounded-3xl"
            />
          ))}
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {plansRes?.data?.map((plan, index) => {
            const isPopular = index === 1 || plansRes.data?.length === 1;

            return (
              <div
                key={plan.id}
                className={`relative bg-bg-paper rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-200 border ${
                  isPopular
                    ? "border-primary-main shadow-xl ring-2 ring-primary-main/20"
                    : "border-divider shadow-sm hover:shadow-md"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary-main text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                    {t("billing.popularTag", "Rekomendasi")}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-text-primary">
                        {plan.name}
                      </h3>
                      {plan.maxSeats > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-bg-default px-2.5 py-1 rounded-full text-text-secondary border border-divider">
                          <Users className="w-3 h-3" />
                          {plan.maxSeats} Seats
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">
                      Kode: {plan.code}
                    </p>
                  </div>

                  <div className="border-b border-divider pb-6">
                    <span className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
                      Rp {plan.price.toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs text-text-secondary font-medium ml-1">
                      / {plan.durationDays} Hari
                    </span>
                  </div>

                  <ul className="space-y-3 text-xs md:text-sm text-text-secondary">
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-success-main/10 text-success-main flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>
                        Masa aktif <strong>{plan.durationDays} hari</strong>
                      </span>
                    </li>
                    {plan.maxSeats > 0 ? (
                      <li className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-success-main/10 text-success-main flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>
                          Maksimal <strong>{plan.maxSeats} pengguna</strong>
                        </span>
                      </li>
                    ) : (
                      <li className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-success-main/10 text-success-main flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>Akses akun individu penuh</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-success-main/10 text-success-main flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>Dukungan prioritas 24/7</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <Button
                    variant={isPopular ? "contained" : "outlined"}
                    color="primary"
                    fullWidth
                    loading={isCheckingOut && activePlanCode === plan.code}
                    disabled={isCheckingOut}
                    onClick={() => handleBuy(plan.code)}
                    startIcon={<CreditCard className="w-4 h-4" />}
                  >
                    {t("billing.buyNow", "Beli Sekarang")}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BillingPage;
