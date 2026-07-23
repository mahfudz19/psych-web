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
export type UserStatus = "active" | "inactive" | "suspended";

/**
 * Interface untuk User Entity sesuai backend
 * Merepresentasikan struktur data user dari database
 */
export interface User {
  /** Unique identifier untuk user */
  id: string;

  /** Email address user */
  email: string;

  /** Nama lengkap user */
  fullName: string;

  /** URL profile picture (nullable) */
  profilePicture: string | null;

  /** Nomor telepon (nullable) */
  phone: string | null;

  /** Bio/deskripsi singkat user (nullable) */
  bio: string | null;

  /** Tanggal lahir format YYYY-MM-DD (nullable) */
  dateOfBirth: string | null;

  /** Gender user (nullable) */
  gender: string | null;

  // === AUTH PROVIDER ===
  /** Provider autentikasi: 'google', 'facebook', 'local' */
  provider: "google" | "facebook" | "local";

  /** External provider ID (nullable untuk local auth) */
  providerId: string | null;

  // === SYSTEM ROLES ===
  /** Array of system roles: ['USER'] atau ['ORGANIZATION'] */
  roles: string[];

  /** Tipe akun: INDIVIDUAL atau ORGANIZATION */
  accountType: AccountType;

  // === ORGANIZATION RELATIONSHIP ===
  /** Foreign Key ke organizations (nullable untuk INDIVIDUAL) */
  organizationId: string | null;

  /** Role user dalam organisasi (nullable) */
  organizationRole: OrganizationRole | null;

  /** Nama organisasi (denormalized, nullable) */
  organizationName: string | null;

  // === SUBSCRIPTION & MONETIZATION ===
  /** Tier subscription user */
  subscriptionTier: SubscriptionTier;

  /** Tanggal expiry subscription (ISO 8601, nullable) */
  subscriptionExpiry: string | null;

  /** Persentase revenue share (0-100, nullable) */
  revenueSharePercentage: number | null;

  // === REFERRAL SYSTEM ===
  /** Kode referral unik user */
  referralCode: string | null;

  /** ID user yang mereferensikan user ini (nullable) */
  referredBy: string | null;

  /** Array of IDs user yang direferensikan oleh user ini */
  referralIds: string[];

  /** Total jumlah referrals (denormalized) */
  totalReferrals: number | null;

  /** Jumlah referrals yang berhasil completed registration */
  successfulReferrals: number | null;

  /** Total earnings dari referrals */
  referralEarnings: number | null;

  /** Timestamp kapan user ini direferensikan (nullable) */
  referredAt: string | null;

  /** Riwayat kode referral yang diarsipkan */
  referralCodeHistory?: ReferralHistoryEntry[];

  // === ORGANIZATION INVITATION ===
  /** Kode undangan unik untuk user ini */
  inviteCode: string | null;

  /** ID user yang mengundang ke organisasi (nullable) */
  invitedBy: string | null;

  /** ID organisasi yang diinvite (nullable) */
  invitedOrganizationId: string | null;

  /** Status undangan */
  invitationStatus: InvitationStatus | null;

  /** Timestamp kapan undangan dikirim */
  invitationSentAt: string | null;

  /** Timestamp kapan undangan diterima (nullable) */
  invitationAcceptedAt: string | null;

  /** Role yang ditawarkan dalam undangan (nullable) */
  invitationRole: string | null;

  // === ACCOUNT STATUS ===
  /** Status akun user */
  status: UserStatus;

  /** Timestamp terakhir login (nullable) */
  lastLoginAt: string | null;

  /** Jumlah percobaan login gagal */
  loginAttempts: number | null;

  // === TIMESTAMPS ===
  /** Timestamp pembuatan akun */
  createdAt: string;

  /** Timestamp terakhir update */
  updatedAt: string;

  /** Timestamp penghapusan akun (soft delete, nullable) */
  deletedAt: string | null;
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
  /** Total jumlah user yang direferensikan */
  totalReferred: number;

  /** Jumlah referral yang berhasil completed registration */
  successfulReferrals: number;

  /** Total earnings dari referrals */
  referralEarnings: number;
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
