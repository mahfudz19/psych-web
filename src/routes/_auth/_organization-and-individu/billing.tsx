import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { CreditCard, History, Sparkles } from "lucide-react";
import Tabs from "../../../components/ui/Tabs";
import Tab from "../../../components/ui/Tabs/Tab";

export const Route = createFileRoute(
  "/_auth/_organization-and-individu/billing",
)({
  component: BillingLayout,
});

const BILLING_TABS = [
  { value: "payment", path: "/billing" },
  { value: "history", path: "/billing/history" },
] as const;

function BillingLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Tentukan tab mana yang aktif berdasarkan URL saat ini
  const currentTab = location.pathname.startsWith("/billing/history")
    ? "history"
    : "payment";

  const handleTabChange = (val: string) => {
    const targetPath =
      BILLING_TABS.find((tab) => tab.value === val)?.path || "/billing";
    navigate({ to: targetPath });
  };

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2 whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-main/10 text-primary-main">
            <Sparkles className="w-3.5 h-3.5" /> Langganan & Tagihan
          </span>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
            Kelola Paket Anda
          </h1>
        </div>

        <div>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab
              value="payment"
              label={
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Pembayaran
                </span>
              }
            />
            <Tab
              value="history"
              label={
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Riwayat
                </span>
              }
            />
          </Tabs>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default BillingLayout;
