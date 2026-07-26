import type { OrganizationRole } from "../../../../../types/user";

/**
 * Interface untuk Organization Member Entity
 * Merepresentasikan data anggota dalam sebuah organisasi
 */
export interface OrganizationMember {
  /** Unique identifier untuk member */
  id: string;

  /** Nama lengkap member */
  fullName: string;

  /** Email member */
  email: string;

  /** URL profile picture (nullable) */
  profilePicture?: string | null;

  /** Role member dalam organisasi */
  role?: OrganizationRole;

  /** Tanggal bergabung dengan organisasi (ISO 8601) */
  joinedAt: string;

  /** Status member (active, inactive, suspended) */
  status?: "active" | "inactive" | "suspended";

  /** Timestamp pembuatan record member */
  createdAt: string;

  /** Timestamp terakhir update */
  updatedAt: string;
}

/**
 * Interface untuk request parameters fetch members list
 * Support pagination, search, filter, dan sort
 */
export interface MembersListParams {
  /** Halaman saat ini (default: 1) */
  page?: number;

  /** Jumlah item per halaman (default: 10) */
  limit?: number;

  /** Search query untuk fullName atau email */
  search?: string;

  /** Field untuk sorting (default: createdAt) */
  sortBy?: "fullName" | "email" | "role" | "joinedAt" | "createdAt";

  /** Urutan sorting (default: desc) */
  sortOrder?: "asc" | "desc";

  /** Filter berdasarkan role */
  role?: OrganizationRole;

  /** Filter berdasarkan status */
  status?: "active" | "inactive" | "suspended";
}

/**
 * Interface untuk request kick member
 */
export interface KickMemberRequest {
  /** ID member yang akan dikeluarkan */
  memberId: string;

  /** Alasan pengeluaran (optional) */
  reason?: string;
}

/**
 * Interface untuk response kick member
 */
export interface KickMemberResponse {
  /** Pesan sukses */
  message: string;

  /** ID member yang dikeluarkan */
  removedMemberId: string;
}
