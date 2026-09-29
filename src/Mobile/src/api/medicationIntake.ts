import instance from "./client";
import {
  CreateMedicationIntake,
  MedicationIntakeResponse,
  TodayMedicationIntake,
} from "../types/MedicationIntakeTypes";

// userId: brak = zalogowany użytkownik, inaczej członek rodziny
export async function medicationIntakeToday(date: string, userId?: string) {
  const response = await instance.get<TodayMedicationIntake[]>(
    "/api/medicationintake/today",
    { params: { date, userId } },
  );
  return response.data;
}

export async function medicationIntakeCreate(intake: CreateMedicationIntake) {
  const response = await instance.post<MedicationIntakeResponse>(
    "/api/medicationintake",
    intake,
  );
  return response.data;
}

// Cofnięcie potwierdzenia — dawka wraca do Pending
export async function medicationIntakeDelete(intakeId: string) {
  await instance.delete(`/api/medicationintake/${intakeId}`);
}
