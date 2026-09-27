import instance from "./client";
import {
  CreateMedicationIntake,
  MedicationIntakeResponse,
  TodayMedicationIntake,
} from "../types/MedicationIntakeTypes";

export async function medicationIntakeToday(date: string) {
  const response = await instance.get<TodayMedicationIntake[]>(
    "/api/medicationintake/today",
    { params: { date } },
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
