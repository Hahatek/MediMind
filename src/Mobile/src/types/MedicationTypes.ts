import { MedicationListScope, MedicationStatus } from "./EnumTypes";
import {
  MedicationScheduleResponse,
  NewMedicationSchedule,
} from "./MedicationScheduleTypes";

export interface CreateMedication {
  name: string;
  strength?: string | null; // np. "5 mg", "875/125 mg"; opcjonalna, pusty napis backend zapisze jako null
  form: string; // np. "tabletka" — jednostka dla amount w porach
  notes?: string | null;
  startDate?: string | null; // "YYYY-MM-DD"
  endDate?: string | null; // brak = bez określonej daty zakończenia
  forUserId?: string | null;
  schedules: NewMedicationSchedule[];
}

// PUT nadpisuje wszystko — null czyści strength/notes/startDate/endDate
export interface UpdateMedication {
  name: string;
  strength?: string | null;
  form: string;
  notes?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

// PATCH tylko ustawia podane pola; wyczyszczenie pola robi się przez PUT
export interface PatchMedication {
  name?: string;
  strength?: string;
  form?: string;
  notes?: string;
  startDate?: string;
  endDate?: string;
}

export interface DiscontinueMedication {
  date: string; // "YYYY-MM-DD", lokalna data z telefonu
}

export interface MedicationResponse {
  id: string;
  userId: string;
  name: string;
  strength?: string | null;
  form: string;
  notes?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  discontinuedOn?: string | null;
}

export interface MedicationListItem extends MedicationResponse {
  status: MedicationStatus;
  schedules: MedicationScheduleResponse[];
}

export interface MedicationListParams {
  date: string; // "YYYY-MM-DD", lokalna data z telefonu
  userId?: string; // brak = zalogowany użytkownik
  scope?: MedicationListScope; // domyślnie "Active"
}
