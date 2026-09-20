export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  price: number;
  durationDays: number;
  targetAudience: "ORGANIZATION" | "INDIVIDU";
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
  status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
  availableBanks: AvailableBank[];
  availableQrCodes: AvailableQrCode[];
  availableEwallets: AvailableEwallet[];
}
