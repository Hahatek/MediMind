import { ExaminationsStatus } from './EnumTypes';

export interface CreateExamination {
    name: string,
    date: string,            // "YYYY-MM-DD"
    time?: string | null,    // "HH:mm:ss"
    description?: string | null,
    location?: string | null,
    status?: ExaminationsStatus,   // backend domyślnie: Pending
    isCyclic: boolean,
    cycleInterval?: number | null,
    preparation?: string | null,
    color?: string | null,
    icon?: string | null,
    doctor?: string | null,
    forUserId?: string | null
}

export interface UpdateExamination {
    name: string,
    date: string,
    time?: string | null,
    description?: string | null,
    location?: string | null,
    status?: ExaminationsStatus | null,
    isCyclic: boolean,
    cycleInterval?: number | null,
    preparation?: string | null,
    color?: string | null,
    icon?: string | null,
    doctor?: string | null
}

export interface PatchExamination {
    name?: string,
    date?: string,
    time?: string,
    description?: string,
    location?: string,
    status?: ExaminationsStatus,
    isCyclic?: boolean,
    cycleInterval?: number,
    preparation?: string,
    color?: string,
    icon?: string,
    doctor?: string
}

export interface ExaminationResponse {
    id: string,
    userId: string,
    date: string,
    time?: string | null,
    name: string,
    description?: string | null,
    location?: string | null,
    status: ExaminationsStatus,
    isCyclic: boolean,
    cycleInterval?: number | null,
    preparation?: string | null,
    color?: string | null,
    icon?: string | null,
    doctor?: string | null,
    googleEventId?: string | null   // synchronizacja z Google Calendar
}
