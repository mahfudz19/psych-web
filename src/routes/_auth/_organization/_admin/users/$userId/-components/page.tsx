import { Mail } from "lucide-react";
import { useState } from "react";
import { Route } from "..";
import { useUserDetailQuery } from "../../-api/user.query";
import Tabs from "../../../../../../../components/ui/Tabs";
import Tab from "../../../../../../../components/ui/Tabs/Tab";
import Overview from "./Overview";
import Sessions from "./Sessions";
import Transactions from "./Transactions";

function UserDetailPage() {
  const { userId } = Route.useParams();
  const { data: response, isLoading } = useUserDetailQuery(userId);
  const [activeTab, setActiveTab] = useState("overview");

  const user = response?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <span className="w-9 h-9 border-4 border-primary-main border-t-transparent rounded-full animate-spin"></span>
        <span className="text-sm font-medium text-text-secondary animate-pulse">
          Memuat detail pengguna...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16 text-text-secondary bg-bg-paper rounded-3xl border border-divider">
        Pengguna tidak ditemukan.
      </div>
    );
  }

  const isActive = user.status === "ACTIVE";

  return (
    <div className="mt-6 flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="p-6 rounded-3xl border border-divider bg-bg-paper shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-main/10 border border-primary-main/20 flex items-center justify-center text-primary-main font-black text-2xl shrink-0 shadow-inner">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-text-primary truncate">
                {user.fullName}
              </h2>
            </div>
            <p className="text-xs text-text-secondary truncate flex items-center gap-1.5 mt-1 font-medium">
              <Mail className="w-3.5 h-3.5 text-text-disabled" /> {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span
            className={`px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full border ${
              isActive
                ? "bg-success-main/10 text-success-main border-success-main/20"
                : "bg-error-main/10 text-error-main border-error-main/20"
            }`}
          >
            {user.status}
          </span>
          <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full border bg-info-main/10 text-info-main border-info-main/20">
            {user.accountType}
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab value="overview" label="Informasi Umum" />
        <Tab value="sessions" label="Sesi Aktif" />
        <Tab value="transactions" label="Riwayat Transaksi" />
      </Tabs>

      {activeTab === "overview" && <Overview user={user} />}
      {activeTab === "sessions" && <Sessions userId={user.id} />}
      {activeTab === "transactions" && <Transactions userId={user.id} />}
    </div>
  );
}

export default UserDetailPage;
