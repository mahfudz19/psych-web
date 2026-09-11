import type { BaseListParams } from "../../../../components/reusebale-components/DataTable";
import type {
  Organization,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  UpdateOrganizationRequest,
  MembersListParams,
  OrganizationMember,
  OrganizationDetailResponse,
  OrganizationMemberDetail,
} from "../../../../types/organization";
import type { User } from "../../../../types/user";
import { api } from "../../../../utils/api";

const BASE = "/api/v1/organizations";

export async function getOrganizations(params: BaseListParams) {
  return api.get<Organization[]>(BASE, { params });
}

export async function getOrganization(orgId: string) {
  return api.get<OrganizationDetailResponse>(`${BASE}/${orgId}/detail`);
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

export async function deleteOrganization(orgId: string) {
  return api.delete<User>(`${BASE}/${orgId}/delete`);
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
  const endpoint = `${BASE}/${orgId}/members/${memberId}/detail`;
  return await api.get<OrganizationMemberDetail>(endpoint);
}

export function kickMember(orgId: string, memberId: string) {
  return api.delete(`${BASE}/${orgId}/members/${memberId}/kick`);
}

export function changeRoleOrganization(
  orgId: string,
  memberId: string,
  role: "member" | "admin",
) {
  const url = `${BASE}/${orgId}/members/${memberId}/role`;
  return api.patch<OrganizationMember>(url, { role });
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
