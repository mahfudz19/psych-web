/**
 * Tipe data untuk Account Type
 * Menentukan apakah user adalah individu atau organisasi
 */
export type AccountType = "INDIVIDUAL" | "ORGANIZATION";

/**
 * Tipe data untuk alasan pengarsipan kode referral
 */
export type ReferralArchiveReason = "regenerated" | "user_request" | "security";

/**
 * Interface untuk entri riwayat kode referral yang diarsipkan
 * Sesuai dengan embedded array referralCodeHistory di MongoDB
 */
export interface ReferralHistoryEntry {
  /** Kode referral lama yang diarsipkan */
  code: string;

  /** Tanggal pengarsipan (ISO 8601) */
  archivedAt: string;

  /** Alasan pengarsipan */
  reason: ReferralArchiveReason;

  /** Kode referral baru yang menggantikan (jika regenerated) */
  replacedBy: string | null;
}

/**
 * Tipe data untuk Role dalam Organisasi
 * Menentukan level akses user dalam konteks organisasi
 */
export type OrganizationRole = "owner" | "admin" | "member";

/**
 * Tipe data untuk Status Invitation
 * Menentukan status undangan ke organisasi
 */
export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

/**
 * Tipe data untuk Tier Subscription
 * Menentukan level langganan user
 */
export type SubscriptionTier = "free" | "premium" | "enterprise";

/**
 * Tipe data untuk Status Akun
 * Menentukan status aktif/non-aktif user
 */
export type UserStatus =
  "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING" | "DELETED";

/**
 * Interface untuk User Entity sesuai backend
 * Merepresentasikan struktur data user dari database
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  profilePicture?: string | null;
  phone?: string | null;
  bio?: string;
  dateOfBirth?: string;
  gender?: "male" | "female";
  roles: string[];
  accountType: AccountType;
  organizationId?: string | null;
  organizationRole?: OrganizationRole | null;
  organizationName?: string | null;
  subscriptionTier: SubscriptionTier;
  referralCode?: string | null;
  inviteCode?: string | null;
  status: UserStatus;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface DeviceInfo {
  userAgent?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  ip?: string;
  location?: string;
  timezone?: string;
  lastActive?: string;
}

export interface Session {
  id: string;
  deviceId?: string;
  deviceInfo?: DeviceInfo;
  status: "active" | "revoked" | "expired" | "rotated";
  createdAt: string;
  lastActive?: string;
  expiresAt: string;
  isCurrentSession: boolean;
}

/**
 * Interface untuk API Response wrapper
 * Format standar response dari backend
 */
export interface ApiResponse<T> {
  /** Data response */
  data: T;

  /** Pesan response (optional) */
  message?: string;

  /** Status success/fail */
  success: boolean;
}

/**
 * Interface untuk Test Access Response
 * Response dari endpoint GET /api/v1/tests/:testId/access
 */
export interface TestAccess {
  /** Apakah user punya akses ke tes ini */
  hasAccess: boolean;

  /** Status tes: 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED' */
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

  /** Apakah user boleh memulai tes (jika status NOT_STARTED) */
  canStart: boolean;

  /** Alasan jika tidak punya akses (optional) */
  reason?: string;

  /** Informasi tambahan tentang tes (optional) */
  testInfo?: {
    testId: string;
    title: string;
    duration: number; // dalam detik
    totalQuestions: number;
  };
}

/**
 * Interface untuk statistik referral
 */
export interface ReferralStats {
  referralCode: string;
  referralEarnings: number;
  revenueSharePercentage: number;
  successfulReferrals: number;
  totalReferrals: number;
}

/**
 * Interface untuk response regenerasi kode referral
 */
export interface RegenerateReferralResponse {
  /** Kode referral baru */
  referralCode: string;

  /** Kode referral lama yang diarsipkan */
  archivedCode: string;

  /** User data yang sudah diupdate */
  user: User;
}
