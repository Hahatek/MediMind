import { DeviceResponse } from "../types/DeviceTypes";
import instance from "./client";

export async function deviceGet(userId: string) {
  const response = await instance.get<DeviceResponse[]>(
    `/api/users/${userId}/devices`,
  );
  return response.data;
}

export async function deviceDelete(userId: string, deviceId: string) {
  await instance.delete(`/api/users/${userId}/devices/${deviceId}`);
}
