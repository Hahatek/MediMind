import { ExaminationResponse } from "../types/ExaminationTypes";

export type ExaminationDisplayStatus =
  | "completed" // Zakończone
  | "skipped" // Ominięte
  | "awaitingConfirmation" // Do potwierdzenia
  | "preparing" // W trakcie przygotowania
  | "sudden" // Nagłe
  | "upcoming" // Nadchodzące
  | "scheduled" // Umówione
  | "pending"; // Oczekujące

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const PREPARATION_WINDOW_MS = 1 * HOUR_MS;
export const UPCOMING_WINDOW_MS = 3 * DAY_MS;

export function getExaminationDateTime(examination: ExaminationResponse): Date {
  const [year, month, day] = examination.date.split("-").map(Number);
  if (examination.time) {
    const [hour, minutes] = examination.time.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minutes);
  }
  return new Date(year, month - 1, day, 23, 59);
}

export function getExaminationDisplayStatus(
  examination: ExaminationResponse,
  now: Date,
): ExaminationDisplayStatus {
  if (examination.status === "Completed") return "completed";
  if (examination.status === "Skipped") return "skipped";

  const msUntil = getExaminationDateTime(examination).getTime() - now.getTime();

  if (msUntil < 0) {
    return "awaitingConfirmation";
  }

  if (
    examination.preparation?.trim() &&
    examination.time &&
    msUntil <= PREPARATION_WINDOW_MS
  ) {
    return "preparing";
  }

  if (examination.status === "Sudden") return "sudden";

  if (msUntil <= UPCOMING_WINDOW_MS) {
    return "upcoming";
  }

  if (examination.time) {
    return "scheduled";
  }
  return "pending";
}

export type ExaminationSection =
  "awaitingConfirmation" | "upcoming" | "history";

// Do której sekcji listy trafia badanie w danym stanie.
// Record wymusza przypisanie każdego z 8 stanów.
export const examinationSectionByStatus: Record<
  ExaminationDisplayStatus,
  ExaminationSection
> = {
  completed: "history",
  skipped: "history",
  awaitingConfirmation: "awaitingConfirmation",
  preparing: "upcoming",
  sudden: "upcoming",
  upcoming: "upcoming",
  scheduled: "upcoming",
  pending: "upcoming",
};
