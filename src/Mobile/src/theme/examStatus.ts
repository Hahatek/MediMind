import type { ExaminationDisplayStatus } from "../utils/examinationDisplayStatus";

export type ExamStatusStyle = {
  label: string;
  /** Klasy NativeWind (pełne, statyczne literały) — kolory jasny/ciemny z global.css. */
  container: string;
  text: string;
};

export const examStatusStyles: Record<
  ExaminationDisplayStatus,
  ExamStatusStyle
> = {
  completed: {
    label: "Zakończone",
    container: "bg-status-closed",
    text: "text-status-closed-foreground",
  },
  skipped: {
    label: "Ominięte",
    container: "bg-status-closed",
    text: "text-status-closed-foreground",
  },
  awaitingConfirmation: {
    label: "Do potwierdzenia",
    container: "bg-status-awaiting-result",
    text: "text-status-awaiting-result-foreground",
  },
  preparing: {
    label: "W trakcie przygotowania",
    container: "bg-status-in-progress",
    text: "text-status-in-progress-foreground",
  },
  sudden: {
    label: "Nagłe",
    container: "bg-status-urgent",
    text: "text-status-urgent-foreground",
  },
  upcoming: {
    label: "Nadchodzące",
    container: "bg-status-scheduled",
    text: "text-status-scheduled-foreground",
  },
  scheduled: {
    label: "Umówione",
    container: "bg-status-scheduled",
    text: "text-status-scheduled-foreground",
  },
  pending: {
    label: "Oczekujące",
    container: "bg-status-planned",
    text: "text-status-planned-foreground",
  },
};

export function getExamStatusStyle(
  status: ExaminationDisplayStatus,
): ExamStatusStyle {
  return examStatusStyles[status];
}
