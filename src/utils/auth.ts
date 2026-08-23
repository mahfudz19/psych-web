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
 * Cek apakah user perlu membuat organization
 * Kondisi: accountType = ORGANIZATION tapi organizationId = null
 * atau user memiliki role ORGANIZATION tapi tidak punya organizationId
 * @param user - User object yang akan dicek
 * @returns boolean - true jika user perlu membuat organization
 */
export function needsOrganizationCreation(
  user: User | null | undefined,
): boolean {
  if (!user) return false;

  const isOrganizationAccountType =
    user.accountType === ACCOUNT_TYPE_ORGANIZATION;
  const hasOrganizationSystemRole = user.roles?.includes("ORGANIZATION");
  const noOrganizationId = !user.organizationId;

  return (
    (isOrganizationAccountType || hasOrganizationSystemRole) && noOrganizationId
  );
}

/**
 * Cek apakah user memiliki organisasi yang valid
 * @param user - User object yang akan dicek
 * @returns boolean - true jika user punya organizationId
 */
export function hasOrganization(user: User | null | undefined): boolean {
  return !!user?.organizationId;
}

export function isIndividualUser(user: User | null | undefined): boolean {
  return user?.accountType === ACCOUNT_TYPE_INDIVIDUAL;
}

export function isOrganizationUser(user?: User | null): boolean {
  const hasOrganizationId = !!user?.organizationId;
  if (hasOrganizationId) {
    return Boolean(
      user?.accountType === ACCOUNT_TYPE_ORGANIZATION || hasOrganizationId,
    );
  }

  return Boolean(user?.accountType === ACCOUNT_TYPE_ORGANIZATION);
}

export function hasOrganizationRole(
  user: User | null | undefined,
  role: OrganizationRole,
): boolean {
  return user?.organizationRole === role;
}

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

export function canAccessDashboard(user: User | null | undefined): boolean {
  return (
    user?.accountType === ACCOUNT_TYPE_ORGANIZATION &&
    user?.roles?.includes("ORGANIZATION")
  );
}

export function canAccessPortal(user: User | null | undefined): boolean {
  return (
    user?.accountType === ACCOUNT_TYPE_INDIVIDUAL &&
    user?.roles?.includes("USER")
  );
}

export function isOrganizationOwner(user: User | null | undefined): boolean {
  return hasOrganizationRole(user, ORG_ROLE_OWNER);
}

export function isAdminOrOwner(user: User | null | undefined): boolean {
  return (
    hasOrganizationRole(user, ORG_ROLE_ADMIN) ||
    hasOrganizationRole(user, ORG_ROLE_OWNER)
  );
}

export function getRedirectPathByRole(user: User | null | undefined): string {
  if (!user) {
    return "/login";
  }

  // Jika user ORGANIZATION tapi belum punya organizationId, arahkan ke create organization
  if (needsOrganizationCreation(user)) {
    return "/create-organization";
  }

  if (isOrganizationUser(user)) {
    return "/dashboard";
  }

  // Default untuk individual user
  return "/portal";
}
