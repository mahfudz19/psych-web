import type { OrganizationRole } from "./user";

/**
 * Tipe data untuk Organization Plan
 * Menentukan tier subscription organisasi
 */
export type OrganizationPlan = "free_trial" | "free" | "premium" | "enterprise";

/**
 * Interface untuk Organization Entity sesuai backend
 * Merepresentasikan struktur data organisasi dari database
 */
export interface Organization {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  ownerId: string;
  plan: OrganizationPlan;
  status: boolean;
  trialStartsAt: string | null;
  trialEndsAt: string | null;
  seats: number;
  seatsUsed: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface untuk request membuat organisasi baru
 */
export interface CreateOrganizationRequest {
  name: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
}

/**
 * Interface untuk request update organisasi
 * Semua field optional karena PATCH
 */
export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
}

/**
 * Interface untuk request delete organisasi
 * Memerlukan confirmation text
 */
export interface DeleteOrganizationRequest {
  confirmation: "DELETE_MY_ORGANIZATION";
}

/**
 * Interface untuk item organisasi di list response
 */
export interface OrganizationListItem {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  ownerId: string;
  plan: OrganizationPlan;
  status: boolean;
  trialEndsAt: string | null;
  seats: number;
  seatsUsed: number;
  role: string;
  createdAt: string;
}

/**
 * Interface untuk response list organisasi
 */
export interface OrganizationListResponse {
  organizations: OrganizationListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * Interface untuk response create organization
 * Mengembalikan organization dan user yang sudah diupdate
 */
export interface CreateOrganizationResponse {
  organization: Organization;
  user: {
    id: string;
    organizationId: string;
    organizationRole: string;
    organizationName: string;
    roles: string[];
    updatedAt: string;
  };
}

/**
 * Interface untuk Organization Member Entity
 * Merepresentasikan data anggota dalam sebuah organisasi
 */
export interface OrganizationMember {
  id: string;
  fullName: string;
  email: string;
  profilePicture?: string | null;
  organizationRole?: OrganizationRole;
  joinedAt: string;
  status?: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
}
export interface MembersListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "fullName" | "email" | "role" | "joinedAt" | "createdAt";
  sortOrder?: "asc" | "desc";
  role?: OrganizationRole;
  status?: "active" | "inactive" | "suspended";
}

/**
 * Interface untuk request kick member
 */
export interface KickMemberRequest {
  memberId: string;
  reason?: string;
}
