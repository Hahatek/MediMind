import { AddGuardian, GuardianResponse } from "../types/GuardianTypes";
import instance from "./client";

export async function guardianGet(wardId: string) {
  const response = await instance.get<GuardianResponse[]>(
    `/api/users/${wardId}/guardians`,
  );
  return response.data;
}

export async function guardianRemove(wardId: string, guardianUserId: string) {
  await instance.delete(`/api/users/${wardId}/guardians/${guardianUserId}`);
}

export async function guardianMakePrimary(
  wardId: string,
  guardianUserId: string,
) {
  await instance.post(
    `/api/users/${wardId}/guardians/${guardianUserId}/make-primary`,
  );
}

export async function guardianAdd(wardId: string, body: AddGuardian) {
  const response = await instance.post<GuardianResponse>(
    `/api/users/${wardId}/guardians`,
    body,
  );
  return response.data;
}
