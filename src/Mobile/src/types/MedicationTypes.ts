export interface CreateMedication {
    name: string,
    dose: number,
    startDate?: string | null,   // "YYYY-MM-DD"
    endDate?: string | null,
    forUserId?: string | null
}

export interface UpdateMedication {
    name: string,
    dose: number,
    startDate?: string | null,
    endDate?: string | null
}

export interface PatchMedication {
    name?: string,
    dose?: number,
    startDate?: string,
    endDate?: string
}

export interface MedicationResponse {
    id: string,
    userId: string,
    name: string,
    dose: number,
    startDate?: string | null,
    endDate?: string | null
}
