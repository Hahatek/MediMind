export type ExamColor = {
  /** Wartość hex zapisywana w bazie (pole `color` badania). */
  value: string;
  /** Nazwa koloru — do czytników ekranu (accessibilityLabel). */
  label: string;
};

export const examColors: ExamColor[] = [
  { value: "#00B3C2", label: "Turkusowy" },
  { value: "#3B82F6", label: "Niebieski" },
  { value: "#6366F1", label: "Fioletowy" },
  { value: "#EC4899", label: "Różowy" },
  { value: "#d9ff30", label: "Limonkowy" },
  { value: "#F59E0B", label: "Pomarańczowy" },
  { value: "#10B981", label: "Zielony" },
  { value: "#94A3B8", label: "Szary" },
];
