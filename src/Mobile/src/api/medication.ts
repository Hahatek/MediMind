import instance from "./client";
import {
  CreateMedication,
  MedicationResponse,
  UpdateMedication,
} from "../types/MedicationTypes";

export async function medicationGet() {
  const response = await instance.get<MedicationResponse[]>("/api/medication");
  return response.data;
}

export async function medicationGetOne(medicationId: string) {
  const response = await instance.get<MedicationResponse>(
    `/api/medication/${medicationId}`,
  );
  return response.data;
}

export async function medicationCreate(medication: CreateMedication) {
  const response = await instance.post<MedicationResponse>(
    "/api/medication",
    medication,
  );
  return response.data;
}

export async function medicationPut(
  medication: UpdateMedication,
  medicationId: string,
) {
  const response = await instance.put<MedicationResponse>(
    `/api/medication/${medicationId}`,
    medication,
  );
  return response.data;
}

export async function medicationDelete(medicationId: string) {
  await instance.delete(`/api/medication/${medicationId}`);
}
