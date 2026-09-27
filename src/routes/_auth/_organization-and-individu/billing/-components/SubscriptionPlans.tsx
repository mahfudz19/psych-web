import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Clock,
  CreditCard,
  Lock,
  Receipt,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState, type Dispatch } from "react";
import { useTranslation } from "react-i18next";
import { useCheckout, useGetSubscriptionPlans } from "../-api/billing.query";
import Button from "../../../../../components/ui/Button";
import Skeleton from "../../../../../components/ui/Skeleton";
import type { SubscriptionPlan as SP } from "../../../_organization/_admin/subscription-plan-management/-api/subscriptionPlan.type";

type SubscriptionPlan = Omit<SP, "createdAt" | "updatedAt">;

const Actions = (props: SelectedPlanProps) => {
  const { selectedPlan, setSelectedPlan } = props;
  const { t } = useTranslation();

  const { mutate: doCheckout, isPending: isCheckingOut } = useCheckout();

  const handleConfirmCheckout = () => {
    if (!selectedPlan) return;

    doCheckout({ planCode: selectedPlan.code });
  };

  return (
    <>
      <Button
        variant="outlined"
        color="white"
        fullWidth
        onClick={() => setSelectedPlan(null)}
        disabled={isCheckingOut}
      >
        {t("common.cancel")}
      </Button>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        loading={isCheckingOut}
        disabled={isCheckingOut}
        onClick={handleConfirmCheckout}
        startIcon={<CreditCard className="w-4 h-4" />}
      >
        Lanjutkan ke Pembayaran
      </Button>
    </>
  );
};

interface SelectedPlanProps {
  selectedPlan: SubscriptionPlan;
  setSelectedPlan: Dispatch<SubscriptionPlan | null>;
}

const SelectedPlan = ({ selectedPlan, setSelectedPlan }: SelectedPlanProps) => {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-bg-paper border border-divider rounded-3xl p-6 md:p-8 shadow-lg space-y-6">
        <div className="flex items-center gap-3 border-b border-divider pb-4">
          <div className="w-12 h-12 bg-primary-main/10 text-primary-main rounded-2xl flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-text-primary ">
              {t("billing.confirmTitle", "Konfirmasi Pesanan")}
            </h2>
            <p className="text-xs text-text-secondary">
              {t(
                "billing.confirmSubtitle",
                "Periksa kembali rincian paket sebelum melanjutkan ke pembayaran.",
              )}
            </p>
          </div>
        </div>

        {/* Rincian Ringkasan */}
        <div className="bg-bg-default border border-divider rounded-2xl p-5 space-y-3 text-sm">
          <div className="flex justify-between items-center pb-3 border-b border-divider">
            <span className="text-text-secondary">Paket Dipilih</span>
            <span className="font-bold text-text-primary">
              {selectedPlan.name}
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-divider">
            <span className="text-text-secondary">Durasi Berlangganan</span>
            <span className="font-medium text-text-primary">
              {selectedPlan.durationDays} Hari
            </span>
          </div>

          {(selectedPlan.maxSeats || 0) > 0 && (
            <div className="flex justify-between items-center pb-3 border-b border-divider">
              <span className="text-text-secondary">Kapasitas Anggota</span>
              <span className="font-medium text-text-primary">
                {selectedPlan.maxSeats || 0} Seats
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1 text-base font-bold">
            <span className="text-text-primary">Total Pembayaran</span>
            <span className="text-primary-main">
              Rp {selectedPlan.price.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Jaminan Pembayaran */}
        <div className="flex items-center gap-2 text-xs text-text-secondary bg-success-main/5 p-3 rounded-xl border border-success-main/20">
          <ShieldCheck className="w-4 h-4 text-success-main shrink-0" />
          <span>
            Transaksi diproses secara aman menggunakan gateway pembayaran resmi.
          </span>
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Actions
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
          />
        </div>
      </div>
    </div>
  );
};

const Plans = ({
  setSelectedPlan,
}: Omit<SelectedPlanProps, "selectedPlan" | "setReferenceId">) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetSubscriptionPlans();

  if (error) {
    return (
      <div className="bg-bg-paper border border-divider rounded-3xl p-8 text-center shadow-sm max-w-xl mx-auto mt-4">
        <div className="w-16 h-16 bg-error-main/10 text-error-main rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">
          {t("billing.accessDeniedTitle", "Akses Terbatas")}
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-6">
          {t(
            "billing.accessDeniedDesc",
            "Halaman langganan hanya dapat diakses oleh Pemilik (Owner) atau Administrator organisasi.",
          )}
        </p>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate({ to: "/dashboard" })}
        >
          {t("common.backToDashboard", "Kembali ke Dashboard")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-text-secondary border-y border-divider py-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-success-main" />
          <span>Pembayaran Aman SSL</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-info-main" />
          <span>Aktivasi Instan</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-warning-main" />
          <span>Tanpa Biaya Tersembunyi</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {data?.data?.map((plan) => {
            const isPopular = plan.recommended;
            return (
              <div
                key={plan.id}
                className={`relative bg-bg-paper rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all border ${
                  isPopular
                    ? "border-primary-main shadow-xl ring-2 ring-primary-main/20"
                    : "border-divider shadow-sm"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary-main text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
                    Rekomendasi
                  </div>
                )}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-text-primary">
                        {plan.name}
                      </h3>
                      {(plan.maxSeats || 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-bg-default px-2.5 py-1 rounded-full text-text-secondary border border-divider">
                          <Users className="w-3 h-3" />
                          {plan.maxSeats || 0} Seats
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary uppercase font-semibold">
                      Kode: {plan.code}
                    </p>
                  </div>
                  <div className="border-b border-divider pb-6">
                    <span className="text-3xl font-extrabold text-text-primary">
                      Rp {plan.price.toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs text-text-secondary font-medium ml-1">
                      / {plan.durationDays} Hari
                    </span>
                  </div>
                  <ul className="space-y-3 text-sm text-text-secondary">
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-success-main/10 text-success-main flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>
                        Masa aktif <strong>{plan.durationDays} hari</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-success-main/10 text-success-main flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>
                        {(plan.maxSeats || 0) > 0
                          ? `Maksimal ${plan.maxSeats || 0} pengguna`
                          : "Akses individu penuh"}
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="pt-8">
                  <Button
                    variant={isPopular ? "contained" : "outlined"}
                    color="primary"
                    fullWidth
                    onClick={() => setSelectedPlan(plan)}
                    startIcon={<CreditCard className="w-4 h-4" />}
                  >
                    Beli Sekarang
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SubscriptionPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );

  if (selectedPlan) {
    return (
      <SelectedPlan
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
      />
    );
  }
  return <Plans setSelectedPlan={setSelectedPlan} />;
};

export default SubscriptionPlans;
