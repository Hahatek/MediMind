import { MedicationTime } from './EnumTypes';

export interface CreateMedicationSchedule {
    medicationId: string,
    timeOfDay: MedicationTime,
    time?: string | null   // "HH:mm:ss"
}

export type UpdateMedicationSchedule = CreateMedicationSchedule;

export interface PatchMedicationSchedule {
    medicationId?: string,
    timeOfDay?: MedicationTime,
    time?: string
}

export interface MedicationScheduleResponse {
    id: string,
    medicationId: string,
    timeOfDay: MedicationTime,
    time?: string | null
}
