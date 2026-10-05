import {
  CreateManagedProfile,
  FamilyDetailsResponse,
  FamilyInviteAccept,
  FamilyInviteResponse,
  FamilyMembership,
  FamilyResponse,
  TransferOwnership,
} from "../types/FamilyTypes";
import instance from "./client";

export async function familyGet() {
  const response = await instance.get<FamilyDetailsResponse[]>("/api/family");
  return response.data;
}

export async function familyCreate() {
  const response = await instance.post<FamilyResponse>("/api/family");
  return response.data;
}

export async function inviteCreate(familyId: string) {
  const response = await instance.post<FamilyInviteResponse>(
    `/api/family/${familyId}/invites`,
  );
  return response.data;
}

export async function inviteCancel(familyId: string, inviteId: string) {
  await instance.delete(`/api/family/${familyId}/invites/${inviteId}`);
}

export async function inviteAccept(body: FamilyInviteAccept) {
  await instance.post(`/api/family/invites/accept`, body);
}

export async function familyDelete(familyId: string) {
  await instance.delete(`/api/family/${familyId}`);
}

export async function familyLeave(familyId: string) {
  await instance.delete(`/api/family/${familyId}/leave`);
}

export async function familyGiveRoleParent(familyId: string, userId: string) {
  await instance.post(`/api/family/${familyId}/members/${userId}/grant-parent`);
}

export async function familyTransferOwnership(
  familyId: string,
  body: TransferOwnership,
) {
  await instance.post(`/api/family/${familyId}/transfer-ownership`, body);
}

export async function familyCreateProfile(
  familyId: string,
  body: CreateManagedProfile,
) {
  const response = await instance.post<FamilyMembership>(
    `/api/family/${familyId}/profiles`,
    body,
  );
  return response.data;
}
