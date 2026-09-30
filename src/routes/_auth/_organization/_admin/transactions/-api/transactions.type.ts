import type {
  SubscriberType,
  SubscriptionStatus,
  TransactionStatus,
} from "../../../../_organization-and-individu/billing/-api/billing.type";

export interface AdminSubscriptionDetail {
  subscriptionId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  canceledAt?: string | null;
}

export interface AdminTransactionsInfo {
  subscriberId: string | null;
  subscriberType: SubscriberType;
  subscriberEmail?: string | null;
  subscriberName?: string | null;
  planId: string | null;
  planCode?: string | null;
  planName?: string | null;
  amount: number;
  currency: string;
  referenceId: string;
  xenditInvoiceId?: string | null;
  checkoutUrl?: string | null;
  paymentMethod?: string | null;
  status: TransactionStatus;
  createdAt: string;
  paidAt?: string | null;
  expiredAt?: string | null;
  subscription?: AdminSubscriptionDetail | null;
}
