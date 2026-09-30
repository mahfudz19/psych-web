import {
  CalendarDays,
  Copy,
  Shield,
  UserCircle,
  UsersIcon,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import type { Users } from "../../-api/user.type";

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const InfoCard = ({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
}) => (
  <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-divider bg-bg-paper shadow-sm">
    <div className="mt-0.5 p-2 rounded-xl bg-divider/10 text-text-secondary [&>svg]:w-4 [&>svg]:h-4">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-sm font-bold text-text-primary mt-0.5 ${className}`}>
        {value}
      </p>
    </div>
  </div>
);

const CopyReferral = ({ referralCode }: { referralCode: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopyReferral}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
        copied
          ? "bg-success-main/10 text-success-main border border-success-main/20"
          : "bg-divider/20 text-text-secondary hover:text-text-primary border border-transparent"
      }`}
    >
      <Copy className="w-3.5 h-3.5" />
      {copied ? "Tersalin!" : "Salin Kode"}
    </button>
  );
};

function Overview({ user }: { user: Users }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* System Info Section */}
      <div>
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
          Informasi Sistem & Akses
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <InfoCard
            icon={<Shield />}
            label="Peran (Roles)"
            value={user.roles.join(", ")}
          />
          <InfoCard
            icon={<CalendarDays />}
            label="Tanggal Daftar"
            value={formatDate(user.createdAt)}
          />
          <InfoCard
            icon={<CalendarDays />}
            label="Pembaruan Terakhir"
            value={formatDate(user.updatedAt)}
          />
        </div>
      </div>

      {/* Referral Program Section */}
      <div>
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
          Program Referral
        </h3>
        <div className="p-6 rounded-3xl border border-divider bg-bg-paper shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-divider">
            <div>
              <p className="text-xs font-semibold text-text-secondary mb-1">
                Kode Referral Pengguna
              </p>
              <p className="text-xl font-black text-primary-main font-mono tracking-wider">
                {user.referralCode}
              </p>
            </div>
            <CopyReferral referralCode={user.referralCode} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-bg-default border border-divider text-center space-y-1">
              <p className="text-xs text-text-secondary font-semibold uppercase flex items-center justify-center gap-1.5">
                <UsersIcon className="w-3.5 h-3.5 text-info-main" /> Total
                Undangan
              </p>
              <p className="text-2xl font-black text-text-primary">
                {user.totalReferrals}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-bg-default border border-divider text-center space-y-1">
              <p className="text-xs text-text-secondary font-semibold uppercase flex items-center justify-center gap-1.5">
                <UserCircle className="w-3.5 h-3.5 text-success-main" />{" "}
                Berhasil
              </p>
              <p className="text-2xl font-black text-success-main">
                {user.successfulReferrals}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-bg-default border border-divider text-center space-y-1">
              <p className="text-xs text-text-secondary font-semibold uppercase flex items-center justify-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-warning-main" /> Total
                Komisi
              </p>
              <p className="text-2xl font-black text-text-primary">
                Rp{user.referralEarnings.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
