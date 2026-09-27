import instance from "./client";
import {
  CreateMedicationSchedule,
  MedicationScheduleResponse,
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
  return response.data;
}

export async function medicationScheduleDelete(scheduleId: string) {
  await instance.delete(`/api/medicationschedule/${scheduleId}`);
}
