import { MedicationTime } from './EnumTypes';

export interface CreateMedicationSchedule {
    medicationId: string,
    timeOfDay: MedicationTime,
    time?: string | null,  // "HH:mm:ss"
    amount: number         // ile jednostek Medication.form, > 0 (np. 0.5)
}

// Pora wysyłana razem z nowym lekiem (CreateMedication.schedules) — bez medicationId, lek dopiero powstaje
export interface NewMedicationSchedule {
    timeOfDay: MedicationTime,
    time?: string | null,  // "HH:mm:ss"
    amount: number         // 0.01–1000, np. 0.5
}

// Bez medicationId — pory nie można przepiąć do innego leku. null w time czyści godzinę.
export interface UpdateMedicationSchedule {
    timeOfDay: MedicationTime,
    time?: string | null,
    amount: number
}

// Tylko ustawia podane pola; wyczyszczenie time robi się przez PUT
export interface PatchMedicationSchedule {
    timeOfDay?: MedicationTime,
    time?: string,
    amount?: number
}

export interface MedicationScheduleResponse {
    id: string,
    medicationId: string,
    timeOfDay: MedicationTime,
    time?: string | null,
    amount: number
}
