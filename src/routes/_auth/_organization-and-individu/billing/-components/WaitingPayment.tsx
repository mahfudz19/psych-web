import { Clock, ExternalLink, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetTransaction } from "../-api/billing.query";
import Alert from "../../../../../components/ui/Alert";
import AlertDescription from "../../../../../components/ui/Alert/AlertDescription";
import AlertTitle from "../../../../../components/ui/Alert/AlertTitle";
import Button from "../../../../../components/ui/Button";
import CanclePayment from "./CanclePayment";

const WaitingPayment = ({ referenceId }: { referenceId: string }) => {
  const { t } = useTranslation();

  const { data: txRes, isLoading } = useGetTransaction(referenceId || "", {
    enabled: !!referenceId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-main" />
        <p className="text-sm text-text-secondary">
          {t("billing.loadingTransaction", "Memuat detail transaksi...")}
        </p>
      </div>
    );
  }

  if (!txRes?.data) {
    return (
      <div className="bg-bg-paper border border-divider rounded-3xl p-8 text-center shadow-sm max-w-xl mx-auto mt-4">
        <h3 className="text-xl font-bold text-text-primary mb-2">
          {t("billing.transactionNotFoundTitle", "Transaksi Tidak Ditemukan")}
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-6">
          {t(
            "billing.transactionNotFoundDesc",
            "Gagal memuat detail transaksi. Silakan coba beberapa saat lagi.",
          )}
        </p>
      </div>
    );
  }

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
        <CanclePayment referenceId={referenceId} />
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-text-secondary pt-4 border-t border-divider">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary-main" />
        <span>Mengecek status pembayaran secara otomatis...</span>
      </div>
    </div>
  );
};

export default WaitingPayment;
