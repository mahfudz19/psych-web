export type TransactionStatus = "PENDING" | "PAID" | "EXPIRED" | "FAILED";
export type SubscriptionStatus =
  "ACTIVE" | "CANCELED" | "EXPIRED" | "PAYMENT_PENDING";

export type TargetAudience = "ORGANIZATION" | "INDIVIDU";

export interface SubscriptionDetail {
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  canceledAt?: string | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  price: number;
  durationDays: number;
  targetAudience: TargetAudience;
  maxSeats: number;
}

export interface CheckoutRequest {
  planCode: string;
}

export interface AvailableBank {
  bank_code: string;
  collection_type: string;
  bank_account_number: string;
  transfer_amount: number;
}

export interface AvailableQrCode {
  qr_code_type: string;
  qr_string: string;
}

export interface AvailableEwallet {
  ewallet_type: string;
}

export interface TransactionDetail {
  referenceId: string;
  checkoutUrl: string;
  status: TransactionStatus;
  availableBanks: AvailableBank[];
  availableQrCodes: AvailableQrCode[];
  availableEwallets: AvailableEwallet[];
}

export interface TransactionHistoryItem {
  referenceId: string;
  planId?: string | null;
  amount: number;
  paymentMethod?: string | null;
  status: TransactionStatus;
  createdAt: string;
  paidAt?: string | null;
  expiredAt?: string | null;
  subscription?: SubscriptionDetail | null;
}

export interface TransactionStatusResponse {
  activeSubscription: {
    startDate: string;
    endDate: string;
    plan: SubscriptionPlan;
  };
  hasActiveSubscription: boolean;
  hasPendingTransaction: boolean;
  pendingReferenceId: string | null;
}
