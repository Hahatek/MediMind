import type {
  AccessCodeResponse,
  CreateAccessCode,
  UserResponse,
} from "./../types/UserTypes";
import instance from "./client";

export async function getMe() {
  const response = await instance.get<UserResponse>("/api/users/me");
  return response.data;
}

export async function accessCodeCreate(userId: string, body: CreateAccessCode) {
  const response = await instance.post<AccessCodeResponse>(
    `/api/users/${userId}/access-codes`,
    body,
  );
  return response.data;
}
