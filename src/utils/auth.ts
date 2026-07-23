/**
 * Utility functions untuk auth logic dan role-based access control
 * File ini berisi helper functions untuk validasi access user berdasarkan
 * accountType, organizationRole, dan invitation status
 */

import type { User, OrganizationRole } from "../types/user";
import {
  ACCOUNT_TYPE_INDIVIDUAL,
  ACCOUNT_TYPE_ORGANIZATION,
} from "../constants/account-types";
import {
  ORG_ROLE_OWNER,
  ORG_ROLE_ADMIN,
  ORGANIZATION_ROLE_HIERARCHY,
} from "../constants/organization-roles";

/**
 * Cek apakah user adalah INDIVIDUAL account (B2C / Kandidat)
 * User dengan accountType INDIVIDUAL akan diarahkan ke Portal area
 * @param user - User object atau null/undefined
 * @returns boolean - true jika user adalah INDIVIDUAL account
 */
export function isIndividualUser(user: User | null | undefined): boolean {
  return user?.accountType === ACCOUNT_TYPE_INDIVIDUAL;
}

/**
 * Cek apakah user adalah ORGANIZATION account (B2B / HRD / Admin)
 * User dengan accountType ORGANIZATION akan diarahkan ke Dashboard area
 * @param user - User object atau null/undefined
 * @returns boolean - true jika user adalah ORGANIZATION account
 */
export function isOrganizationUser(user: User | null | undefined): boolean {
  return user?.accountType === ACCOUNT_TYPE_ORGANIZATION;
}

/**
 * Cek apakah user memiliki organization role tertentu
 * Berguna untuk validasi akses ke fitur-fitur spesifik dalam organisasi
 * @param user - User object atau null/undefined
 * @param role - Organization role yang akan dicek
 * @returns boolean - true jika user memiliki role yang sesuai
 */
export function hasOrganizationRole(
  user: User | null | undefined,
  role: OrganizationRole,
): boolean {
  return user?.organizationRole === role;
}

/**
 * Cek apakah user memiliki akses organization role tertentu atau lebih tinggi
 * Menggunakan hierarki role: owner > admin > member
 * @param user - User object atau null/undefined
 * @param role - Organization role minimum yang diperlukan
 * @returns boolean - true jika user memiliki role >= role yang diperlukan
 */
export function hasOrganizationRoleOrHigher(
  user: User | null | undefined,
  role: OrganizationRole,
): boolean {
  if (!user?.organizationRole) return false;
  return (
    ORGANIZATION_ROLE_HIERARCHY[user.organizationRole] >=
    ORGANIZATION_ROLE_HIERARCHY[role]
  );
}

/**
 * Cek apakah user dapat mengakses Dashboard area (B2B Workspace)
 * Syarat: accountType = ORGANIZATION dan roles includes 'ORGANIZATION'
 * @param user - User object atau null/undefined
 * @returns boolean - true jika user dapat akses dashboard
 */
export function canAccessDashboard(user: User | null | undefined): boolean {
  return (
    user?.accountType === ACCOUNT_TYPE_ORGANIZATION &&
    user?.roles?.includes("ORGANIZATION")
  );
}

/**
 * Cek apakah user dapat mengakses Portal area (B2C / Kandidat)
 * Syarat: accountType = INDIVIDUAL dan roles includes 'USER'
 * @param user - User object atau null/undefined
 * @returns boolean - true jika user dapat akses portal
 */
export function canAccessPortal(user: User | null | undefined): boolean {
  return (
    user?.accountType === ACCOUNT_TYPE_INDIVIDUAL &&
    user?.roles?.includes("USER")
  );
}

/**
 * Cek apakah user adalah owner dari organization
 * Owner memiliki akses penuh ke semua fitur organisasi
 * @param user - User object atau null/undefined
 * @returns boolean - true jika user adalah owner
 */
export function isOrganizationOwner(user: User | null | undefined): boolean {
  return hasOrganizationRole(user, ORG_ROLE_OWNER);
}

/**
 * Cek apakah user adalah admin atau owner dari organization
 * Admin dan owner memiliki akses ke fitur administratif
 * @param user - User object atau null/undefined
 * @returns boolean - true jika user adalah admin atau owner
 */
export function isAdminOrOwner(user: User | null | undefined): boolean {
  return (
    hasOrganizationRole(user, ORG_ROLE_ADMIN) ||
    hasOrganizationRole(user, ORG_ROLE_OWNER)
  );
}

/**
 * Get redirect path berdasarkan account type dan status user
 * Helper function untuk menentukan redirect yang tepat setelah login
 * @param user - User object atau null/undefined
 * @returns string - Path untuk redirect
 */
export function getRedirectPathByRole(user: User | null | undefined): string {
  if (!user) {
    return "/login";
  }

  // Handle organization user tanpa organization
  if (isOrganizationUser(user) && !user.organizationId) {
    return "/register/organization";
  }

  // Normal redirect berdasarkan account type
  if (isOrganizationUser(user)) {
    return "/dashboard";
  }

  // Default untuk individual user
  return "/portal/tests";
}
