import instance from "./client";
import { requestReminderSync } from "../notifications/sync";
import {
  CreateMedicationSchedule,
  MedicationScheduleResponse,
  UpdateMedicationSchedule,
} from "../types/MedicationScheduleTypes";

// Bez argumentu: wszystkie widoczne pory. Z medicationId: tylko pory tego leku.
export async function medicationScheduleGet(medicationId?: string) {
  const response = await instance.get<MedicationScheduleResponse[]>(
    "/api/medicationschedule",
    { params: { medicationId } },
  );
  return response.data;
}

export async function medicationScheduleCreate(
  schedule: CreateMedicationSchedule,
) {
  const response = await instance.post<MedicationScheduleResponse>(
    "/api/medicationschedule",
    schedule,
  );
  requestReminderSync();
  return response.data;
}

export async function medicationSchedulePut(
  schedule: UpdateMedicationSchedule,
  scheduleId: string,
) {
  const response = await instance.put<MedicationScheduleResponse>(
    `/api/medicationschedule/${scheduleId}`,
    schedule,
  );
  requestReminderSync();
  return response.data;
}

// Pora z historią przyjęć zwraca 409
export async function medicationScheduleDelete(scheduleId: string) {
  await instance.delete(`/api/medicationschedule/${scheduleId}`);
  requestReminderSync();
}
