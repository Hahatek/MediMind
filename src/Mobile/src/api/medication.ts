import instance from "./client";
import {
  CreateMedication,
  DiscontinueMedication,
  MedicationListItem,
  MedicationListParams,
  MedicationResponse,
  PatchMedication,
  UpdateMedication,
} from "../types/MedicationTypes";

// Lista leków jednej osoby razem z porami; status liczony dla params.date
export async function medicationGet(params: MedicationListParams) {
  const response = await instance.get<MedicationListItem[]>("/api/medication", {
    params,
  });
  return response.data;
}

export async function medicationGetOne(medicationId: string) {
  const response = await instance.get<MedicationResponse>(
    `/api/medication/${medicationId}`,
  );
  return response.data;
}

// Lek razem z porami w jednym requeście — błąd którejkolwiek pory odrzuca całość (nic się nie zapisuje).
// Dodanie pory do istniejącego leku: medicationScheduleCreate.
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

export async function medicationPatch(
  medication: PatchMedication,
  medicationId: string,
) {
  const response = await instance.patch<MedicationResponse>(
    `/api/medication/${medicationId}`,
    medication,
  );
  return response.data;
}

// Normalny sposób zakończenia leku — lek i historia zostają
export async function medicationDiscontinue(
  body: DiscontinueMedication,
  medicationId: string,
) {
  const response = await instance.post<MedicationResponse>(
    `/api/medication/${medicationId}/discontinue`,
    body,
  );
  return response.data;
}

// Cofnięcie pomyłkowego odstawienia (409, gdy lek nie jest odstawiony)
export async function medicationResume(medicationId: string) {
  const response = await instance.post<MedicationResponse>(
    `/api/medication/${medicationId}/resume`,
  );
  return response.data;
}

// Tylko dla pomyłek: lek z historią przyjęć zwraca 409 (trzeba go odstawić)
export async function medicationDelete(medicationId: string) {
  await instance.delete(`/api/medication/${medicationId}`);
}
