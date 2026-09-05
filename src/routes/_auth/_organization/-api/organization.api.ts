import type {
  Organization,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  UpdateOrganizationRequest,
  DeleteOrganizationRequest,
  MembersListParams,
  OrganizationMember,
} from "../../../../types/organization";
import type { User } from "../../../../types/user";
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
  const endpoint = `${BASE}/${orgId}/members`;

  return await api.get<OrganizationMember[]>(endpoint, { params });
}

export async function getMemberById(orgId: string, memberId: string) {
  const endpoint = `${BASE}/${orgId}/members/${memberId}`;
  return await api.get<OrganizationMember>(endpoint);
}

export function kickMember(orgId: string, memberId: string) {
  return api.delete(`${BASE}/${orgId}/members/${memberId}/kick`);
}

export function leaveOrganization(orgId: string) {
  return api.patch<User>(`${BASE}/${orgId}/members/leave`);
}

export function joinOrganization(orgId: string) {
  return api.patch<User>(`${BASE}/${orgId}/members/join`);
}

export function generateInviteCode() {
  return api.post<User>(`${BASE}/invite-code`);
}
