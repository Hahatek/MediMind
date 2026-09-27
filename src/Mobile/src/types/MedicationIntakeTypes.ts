import { IntakeStatus, MedicationTime, TodayIntakeStatus } from "./EnumTypes";

export interface CreateMedicationIntake {
  medicationScheduleId: string;
  date?: string | null; // "YYYY-MM-DD"
  status: IntakeStatus;
}

export interface MedicationIntakeResponse {
  id: string;
  medicationScheduleId: string;
  userId: string;
  date: string;
  status: IntakeStatus;
  recordedAt: string;
  recordedByUserId?: string | null;
}

export interface TodayMedicationIntake {
  medicationScheduleId: string;
  medicationId: string;
  medicationName: string;
  timeOfDay: MedicationTime;
  time?: string | null;
  status: TodayIntakeStatus;
  intakeId?: string | null;
}
