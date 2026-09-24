import type { ExaminationsStatus } from "../types/EnumTypes";

/** Identyfikatory wizualnych kategorii statusu (nie wartości z backendu). */
export type ExamStatusCategory =
  | "planned"
  | "scheduled"
  | "inProgress"
  | "awaitingResult"
  | "closed"
  | "urgent";

export type ExamStatusStyle = {
  label: string;
  /** Klasy NativeWind (pełne, statyczne literały) — kolory jasny/ciemny z global.css. */
  container: string;
  text: string;
};

// Kolory statusów: zmienne --status-*-bg/-fg w global.css. Etykieta tekstowa
// jest zawsze pokazywana obok koloru.
export const examStatusStyles: Record<ExamStatusCategory, ExamStatusStyle> = {
  planned: {
    label: "Zaplanowane",
    container: "bg-status-planned",
    text: "text-status-planned-foreground",
  },
  scheduled: {
    label: "Umówione",
    container: "bg-status-scheduled",
    text: "text-status-scheduled-foreground",
  },
  inProgress: {
    label: "W trakcie",
    container: "bg-status-in-progress",
    text: "text-status-in-progress-foreground",
  },
  awaitingResult: {
    label: "Oczekuje na wynik",
    container: "bg-status-awaiting-result",
    text: "text-status-awaiting-result-foreground",
  },
  closed: {
    label: "Wykonane / pominięte",
    container: "bg-status-closed",
    text: "text-status-closed-foreground",
  },
  urgent: {
    label: "Pilne",
    container: "bg-status-urgent",
    text: "text-status-urgent-foreground",
  },
};

/**
 * Mapowanie wartości z backendu (bez zmian) na kategorię wizualną.
 * Record wymusza obsłużenie każdej nowej wartości ExaminationsStatus.
 */
export const examStatusCategoryByBackend: Record<
  ExaminationsStatus,
  ExamStatusCategory
> = {
  Planned: "planned",
  Scheduled: "scheduled",
  InProgress: "inProgress",
  Pending: "awaitingResult",
  Completed: "closed",
  Skipped: "closed",
  Sudden: "urgent",
};

export function getExamStatusStyle(status: ExaminationsStatus): ExamStatusStyle {
  return examStatusStyles[examStatusCategoryByBackend[status]];
}
