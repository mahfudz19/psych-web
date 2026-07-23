/**
 * Konstanta untuk Organization Roles
 * Menentukan level akses user dalam konteks organisasi
 */

import type { OrganizationRole } from "../types/user";

/**
 * Role Owner - Akses penuh ke organisasi
 * Dapat mengelola semua aspek organisasi termasuk menghapus organisasi
 */
export const ORG_ROLE_OWNER: OrganizationRole = "owner";

/**
 * Role Admin - Akses administratif
 * Dapat mengelola anggota, tes, dan pengaturan organisasi
 * Tidak dapat menghapus organisasi
 */
export const ORG_ROLE_ADMIN: OrganizationRole = "admin";

/**
 * Role Member - Akses terbatas
 * Dapat melihat dan menggunakan fitur organisasi
 * Tidak dapat mengelola pengaturan atau anggota
 */
export const ORG_ROLE_MEMBER: OrganizationRole = "member";

/**
 * Array berisi semua valid organization roles
 * Berguna untuk validasi dan type checking
 */
export const VALID_ORGANIZATION_ROLES: OrganizationRole[] = [
  ORG_ROLE_OWNER,
  ORG_ROLE_ADMIN,
  ORG_ROLE_MEMBER,
];

/**
 * Helper function untuk mengecek apakah value adalah valid OrganizationRole
 * @param value - Value yang akan dicek
 * @returns boolean - true jika valid OrganizationRole
 */
export function isValidOrganizationRole(
  value: string,
): value is OrganizationRole {
  return VALID_ORGANIZATION_ROLES.includes(value as OrganizationRole);
}

/**
 * Hierarki role organisasi (dari tertinggi ke terendah)
 * Digunakan untuk perbandingan level akses
 */
export const ORGANIZATION_ROLE_HIERARCHY: Record<OrganizationRole, number> = {
  [ORG_ROLE_OWNER]: 3,
  [ORG_ROLE_ADMIN]: 2,
  [ORG_ROLE_MEMBER]: 1,
};

/**
 * Helper function untuk mengecek apakah role1 memiliki akses >= role2
 * @param role1 - Role yang akan dicek aksesnya
 * @param role2 - Role yang dibandingkan
 * @returns boolean - true jika role1 memiliki akses >= role2
 */
export function hasRoleAccess(
  role1: OrganizationRole,
  role2: OrganizationRole,
): boolean {
  return (
    ORGANIZATION_ROLE_HIERARCHY[role1] >= ORGANIZATION_ROLE_HIERARCHY[role2]
  );
}
