import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TransactionStatusResponse } from "../-api/billing.type";
import CancelActiveSubscription from "./CancelActiveSubscription";

const ActiveSubscription = (data: TransactionStatusResponse) => {
  const { t } = useTranslation();
  const activeSub = data.activeSubscription;
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
};

export default ActiveSubscription;
