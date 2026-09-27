import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetTransaction,
  useGetTransactionStatus,
} from "../-api/billing.query";
import Alert from "../../../../../components/ui/Alert";
import AlertDescription from "../../../../../components/ui/Alert/AlertDescription";
import AlertTitle from "../../../../../components/ui/Alert/AlertTitle";
import Button from "../../../../../components/ui/Button";
import CanclePayment from "./CanclePayment";
import SubscriptionPlans from "./SubscriptionPlans";
import CancelActiveSubscription from "./CancelActiveSubscription";

const BillingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [referenceId, setReferenceId] = useState<string | null>(null);

  const { data: statusRes, isLoading: isLoadingStatus } =
    useGetTransactionStatus();

  useEffect(() => {
    if (
      statusRes?.data?.hasPendingTransaction &&
      statusRes.data.pendingReferenceId
    ) {
      setReferenceId(statusRes.data.pendingReferenceId);
    }
  }, [statusRes]);

  const { data: txRes } = useGetTransaction(referenceId || "", {
    enabled: !!referenceId,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (status === "PAID" || status === "EXPIRED" || status === "FAILED") {
        queryClient.invalidateQueries({ queryKey: ["transactions", "status"] });
        return false;
      }
      return 5000;
    },
  });

  const txStatus = txRes?.data?.status;

  useEffect(() => {
    if (
      txStatus === "PAID" ||
      txStatus === "EXPIRED" ||
      txStatus === "FAILED"
    ) {
      queryClient.invalidateQueries({ queryKey: ["transactions", "status"] });
    }
  }, [txStatus, queryClient]);

  if (isLoadingStatus) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-main" />
        <p className="text-sm text-text-secondary">
          Memeriksa status langganan...
        </p>
      </div>
    );
  }

  // 1. KONDISI: Pembayaran Berhasil
  if (txStatus === "PAID") {
    return (
      <div className="bg-bg-paper border border-divider rounded-3xl p-8 md:p-12 text-center shadow-lg mt-4 space-y-6 w-full">
        <div className="w-20 h-20 bg-success-main/10 text-success-main rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
            {t("billing.successTitle", "Pembayaran Berhasil!")}
          </h2>
          <p className="text-text-secondary mt-2 text-sm leading-relaxed">
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
    );
  }

  // 2. KONDISI: Menunggu Pembayaran
  if (referenceId && txRes?.data) {
    return (
      <div className="bg-bg-paper border border-divider rounded-3xl p-6 md:p-10 shadow-lg mt-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-2 bg-warning-main/10 text-warning-main px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase animate-pulse">
            <Clock className="w-4 h-4" />
            {t("billing.pendingStatus", "Menunggu Pembayaran")}
          </span>
          <h2 className="text-2xl font-extrabold text-text-primary">
            {t("billing.completePayment", "Selesaikan Pembayaran")}
          </h2>
          <p className="text-text-secondary text-sm">
            Kode Referensi:{" "}
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
              "Silakan selesaikan transaksi melalui link pembayaran Xendit di bawah ini. Sistem akan mendeteksi otomatis.",
            )}
          </AlertDescription>
        </Alert>

        <div className="space-y-3 pt-2">
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              if (txRes.data?.checkoutUrl)
                window.open(
                  txRes.data.checkoutUrl,
                  "_blank",
                  "noopener,noreferrer",
                );
            }}
            endIcon={<ExternalLink className="w-4 h-4" />}
          >
            Buka Halaman Pembayaran Xendit
          </Button>
          <CanclePayment
            referenceId={referenceId}
            setReferenceId={setReferenceId}
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-text-secondary pt-4 border-t border-divider">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary-main" />
          <span>Mengecek status pembayaran secara otomatis...</span>
        </div>
      </div>
    );
  }

  // 3. KONDISI: Punya Langganan Aktif (Tidak bisa beli paket baru sebelum dibatalkan)
  if (statusRes?.data?.hasActiveSubscription) {
    const activeSub = statusRes.data.activeSubscription;
    const plan = activeSub?.plan;

    const startDateFormatted = activeSub?.startDate
      ? new Date(activeSub.startDate).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-";

    const endDateFormatted = activeSub?.endDate
      ? new Date(activeSub.endDate).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-";

    return (
      <div className="bg-bg-paper border border-divider rounded-3xl p-6 md:p-10 shadow-lg mt-4 max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-success-main/10 text-success-main rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-success-main/10 text-success-main mb-2">
              Langganan Aktif
            </span>
            <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
              {plan?.name ||
                t("billing.activeSubscriptionTitle", "Langganan Sedang Aktif")}
            </h2>
          </div>
        </div>

        {/* Card Rincian Paket */}
        <div className="bg-bg-default border border-divider rounded-2xl p-5 space-y-4 text-sm">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <span className="text-text-secondary">Nama Paket</span>
            <span className="font-bold text-text-primary">
              {plan?.name ?? "-"}
            </span>
          </div>

          {plan?.price !== undefined && (
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <span className="text-text-secondary">Harga</span>
              <span className="font-bold text-text-primary">
                Rp {plan.price.toLocaleString("id-ID")}
              </span>
            </div>
          )}

          {plan?.maxSeats && (
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <span className="text-text-secondary">Kapasitas Anggota</span>
              <span className="font-bold text-text-primary">
                {plan.maxSeats} Seats
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-divider pb-3">
            <span className="text-text-secondary">Mulai Berlangganan</span>
            <span className="font-medium text-text-primary">
              {startDateFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Berlaku Hingga</span>
            <span className="font-bold text-primary-main">
              {endDateFormatted}
            </span>
          </div>
        </div>

        {/* Komponen Pembatalan Langganan */}
        <CancelActiveSubscription />
      </div>
    );
  }

  // 4. KONDISI DEFAULT: Belum punya langganan (Tampilkan Etalase)
  return <SubscriptionPlans setReferenceId={setReferenceId} />;
};

export default BillingPage;
