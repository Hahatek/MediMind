import { IntakeStatus, MedicationTime, TodayIntakeStatus } from "./EnumTypes";

export interface CreateMedicationIntake {
  medicationScheduleId: string;
  date: string; // "YYYY-MM-DD", lokalna data z telefonu (wymagana)
  status: IntakeStatus; // ponowny POST z innym statusem zmienia istniejący wpis (Skipped <-> Taken)
}

export interface MedicationIntakeResponse {
  id: string;
  medicationScheduleId: string;
  userId: string;
  date: string;
  status: IntakeStatus;
  recordedAt: string;
  recordedByUserId?: string | null;
  scheduledTime?: string | null; // godzina z harmonogramu w chwili zapisu dawki
  scheduledAmount: number; // ilość z harmonogramu w chwili zapisu dawki
}

export interface TodayMedicationIntake {
  medicationScheduleId: string;
  medicationId: string;
  medicationName: string;
  strength?: string | null;
  form: string;
  notes?: string | null; // notatka leku, np. "po jedzeniu"
  amount: number;
  timeOfDay: MedicationTime;
  time?: string | null;
  status: TodayIntakeStatus;
  intakeId?: string | null;
}
