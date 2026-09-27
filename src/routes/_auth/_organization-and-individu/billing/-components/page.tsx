import { RefreshCw } from "lucide-react";
import { useGetTransactionStatus } from "../-api/billing.query";
import ActiveSubscription from "./ActiveSubscription";
import SubscriptionPlans from "./SubscriptionPlans";
import WaitingPayment from "./WaitingPayment";

const BillingPage = () => {
  const { data: statusRes, isLoading: isLoadingStatus } =
    useGetTransactionStatus();

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

  if (
    statusRes?.data?.hasPendingTransaction &&
    statusRes.data.pendingReferenceId
  ) {
    return <WaitingPayment referenceId={statusRes.data.pendingReferenceId} />;
  }

  if (statusRes?.data?.hasActiveSubscription) {
    return <ActiveSubscription {...statusRes?.data} />;
  }

  return <SubscriptionPlans />;
};

export default BillingPage;
