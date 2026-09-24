import type { UserResponse } from "./../types/UserTypes";
import instance from "./client";

export async function getMe() {
  const response = await instance.get<UserResponse>("/api/users/me");
  return response.data;
}
