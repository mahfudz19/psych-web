import type {
  Organization,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  UpdateOrganizationRequest,
  DeleteOrganizationRequest,
  MembersListParams,
  OrganizationMember,
  KickMemberResponse,
} from "../../../../types/organization";
import { api } from "../../../../utils/api";

const BASE = "/api/v1/organizations";

export async function getOrganization(orgId: string) {
  return api.get<Organization>(`${BASE}/${orgId}/detail`);
}

export async function createOrganization(data: CreateOrganizationRequest) {
  return api.post<CreateOrganizationResponse>(BASE, data);
}

export async function updateOrganization({
  orgId,
  data,
}: {
  orgId: string;
  data: UpdateOrganizationRequest;
}) {
  return api.patch<CreateOrganizationResponse>(`${BASE}/${orgId}/update`, data);
}

export async function deleteOrganization({
  orgId,
  confirmation,
}: {
  orgId: string;
  confirmation: DeleteOrganizationRequest["confirmation"];
}) {
  return api.delete(`${BASE}/${orgId}/delete`, {
    body: JSON.stringify({ confirmation }),
  });
}

export async function uploadOrganizationLogo({
  orgId,
  file,
}: {
  orgId: string;
  file: File;
}) {
  const formData = new FormData();
  formData.append("logo", file);
  return api.post<Organization>(`${BASE}/${orgId}/logo`, formData);
}

export async function getMembers(orgId: string, params?: MembersListParams) {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params?.role) queryParams.append("role", params.role);
  if (params?.status) queryParams.append("status", params.status);

  const queryString = queryParams.toString();
  const endpoint = `${BASE}/${orgId}/members${queryString ? `?${queryString}` : ""}`;

  return await api.get<OrganizationMember[]>(endpoint);
}

export function kickMember(orgId: string, memberId: string) {
  return api.delete<KickMemberResponse>(`${BASE}/${orgId}/members/${memberId}`);
}
