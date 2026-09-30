import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import {
  CreditCard,
  HelpCircle,
  History,
  MessageSquare,
  Sparkles,
} from "lucide-react";
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

      <div className="max-w-4xl mx-auto space-y-6">
        <Outlet />

        {/* Card Bantuan WhatsApp Admin */}
        <div className="p-5 rounded-3xl border border-divider bg-bg-paper shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-success-main/10 text-success-main shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Mengalami Kendala Pembayaran?
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Tim admin kami siap membantu verifikasi atau kendala transaksi
                kamu.
              </p>
            </div>
          </div>

          <AdminContact />
        </div>
      </div>
    </div>
  );
}

const AdminContact = () => {
  const WA_NUMBER = "6281234567890";
  const WA_MESSAGE = encodeURIComponent(
    "Halo Admin, saya mengalami kendala pada halaman pembayaran. Mohon bantuannya.",
  );
  const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

  return (
    <a
      href={WA_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-success-main hover:bg-success-dark text-white text-xs font-bold transition-all shadow-sm shrink-0 active:scale-95"
    >
      <MessageSquare className="w-4 h-4" />
      Hubungi Admin WA
    </a>
  );
};

export default BillingLayout;
