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

export function isIndividualUser(user: User | null | undefined): boolean {
  return user?.accountType === ACCOUNT_TYPE_INDIVIDUAL;
}

export function isOrganizationUser(user?: User | null): boolean {
  const noOrganization = !user?.organizationId;
  if (noOrganization) {
    return Boolean(
      user?.accountType === ACCOUNT_TYPE_ORGANIZATION || noOrganization,
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

  if (isOrganizationUser(user)) {
    return "/dashboard";
  }

  // Default untuk individual user
  return "/portal";
}
