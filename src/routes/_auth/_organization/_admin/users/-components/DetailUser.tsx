import {
  Eye,
  X,
  Copy,
  UserCircle,
  Mail,
  CalendarDays,
  Shield,
  CreditCard,
  Users as UsersIcon,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import IconButton from "../../../../../../components/ui/IconButton";
import type { Users } from "../-api/user.type";
import Dialog from "../../../../../../components/ui/DIalog";
import { useUserDetailQuery } from "../-api/user.query";

// Helper untuk format tanggal
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

const ContentDetailUser = ({ id }: { id: string }) => {
  const { data: response, isLoading } = useUserDetailQuery(id);
  const user = response?.data;
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <span className="w-8 h-8 border-4 border-primary-main border-t-transparent rounded-full animate-spin"></span>
        <span className="text-sm text-text-secondary animate-pulse">
          Memuat detail pengguna...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10 text-text-secondary">
        Pengguna tidak ditemukan.
      </div>
    );
  }

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOpt = user.status === "ACTIVE";

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* 1. Profile Header */}
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-divider bg-divider/10">
        <div className="w-16 h-16 rounded-full bg-primary-main/10 flex items-center justify-center text-primary-main font-bold text-xl shrink-0">
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-lg font-bold text-text-primary truncate">
            {user.fullName}
          </h3>
          <p className="text-sm text-text-secondary truncate flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3.5 h-3.5" /> {user.email}
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0 items-end">
          <span
            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${isOpt ? "bg-success-main/10 text-success-main border-success-main/20" : "bg-error-main/10 text-error-main border-error-main/20"}`}
          >
            {user.status}
          </span>
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border bg-info-main/10 text-info-main border-info-main/20">
            {user.accountType}
          </span>
        </div>
      </div>

      {/* 2. Account Details Grid */}
      <div>
        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
          Informasi Sistem
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            icon={<Shield />}
            label="Peran (Roles)"
            value={user.roles.join(", ")}
          />
          <InfoCard
            icon={<CreditCard />}
            label="Tingkat Langganan"
            value={user.subscriptionTier}
            className="capitalize"
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

      {/* 3. Referral Program Section */}
      <div>
        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
          Program Referral
        </h4>
        <div className="p-4 rounded-2xl border border-divider bg-bg-paper">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-divider">
            <div>
              <p className="text-xs text-text-secondary mb-1">Kode Referral</p>
              <p className="text-base font-bold text-primary-main font-mono tracking-wide">
                {user.referralCode}
              </p>
            </div>
            <button
              onClick={handleCopyReferral}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${copied ? "bg-success-main/10 text-success-main" : "bg-divider/20 text-text-secondary hover:text-text-primary"}`}
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Tersalin!" : "Salin Kode"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {user.totalReferrals}
              </p>
              <p className="text-[10px] text-text-secondary uppercase mt-1 flex items-center justify-center gap-1">
                <UsersIcon className="w-3 h-3" /> Total
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success-main">
                {user.successfulReferrals}
              </p>
              <p className="text-[10px] text-text-secondary uppercase mt-1 flex items-center justify-center gap-1">
                <UserCircle className="w-3 h-3" /> Berhasil
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                Rp{user.referralEarnings.toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] text-text-secondary uppercase mt-1 flex items-center justify-center gap-1">
                <Wallet className="w-3 h-3" /> Komisi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-komponen untuk merapikan grid informasi
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
  <div className="flex items-start gap-3 p-3 rounded-xl border border-divider bg-bg-paper">
    <div className="mt-0.5 text-text-disabled [&>svg]:w-4 [&>svg]:h-4">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-medium text-text-secondary uppercase">
        {label}
      </p>
      <p
        className={`text-sm font-semibold text-text-primary mt-0.5 ${className}`}
      >
        {value}
      </p>
    </div>
  </div>
);

function DetailUser({ user }: { user: Users }) {
  return (
    <Dialog
      className="text-left p-0 overflow-hidden sm:max-w-lg" // Hapus padding default agar header menempel
      isDynamic={true} // Manfaatkan fitur lazy load yang baru kita buat
      trigger={(openDialog) => (
        <IconButton variant="text" size="sm" onClick={() => openDialog()}>
          <Eye size={16} />
        </IconButton>
      )}
    >
      {(close) => (
        <div className="flex flex-col max-h-[85vh]">
          {/* Header Dialog (Sticky) */}
          <div className="sticky top-0 z-10 px-6 py-4 border-b border-divider bg-bg-paper flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Detail Pengguna
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Melihat informasi lengkap dan metrik afiliasi pengguna.
              </p>
            </div>
            <IconButton
              tabIndex={-1}
              onClick={() => close()}
              variant="text"
              color="error"
              size="sm"
              className="shrink-0 bg-error-main/10"
            >
              <X size={18} />
            </IconButton>
          </div>

          {/* Konten Scrollable */}
          <div className="px-6 pb-6 overflow-y-auto">
            <ContentDetailUser id={user.id} />
          </div>
        </div>
      )}
    </Dialog>
  );
}

export default DetailUser;
