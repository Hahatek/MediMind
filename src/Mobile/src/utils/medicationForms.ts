import { pluralize } from "./pluralize";

// Postać leku z formami odmiany (kolejność jak parametry pluralize).
// W bazie (Medication.form) zapisujemy `one`; postać spoza listy („Inna”) wyświetlamy bez odmiany.
export type MedicationFormOption = {
  one: string; // 1 tabletka
  few: string; // 2 tabletki, 0,5 tabletki
  many: string; // 5 tabletek
};

export const medicationForms: MedicationFormOption[] = [
  { one: "tabletka", few: "tabletki", many: "tabletek" },
  { one: "kapsułka", few: "kapsułki", many: "kapsułek" },
  { one: "saszetka", few: "saszetki", many: "saszetek" },
  { one: "kropla", few: "krople", many: "kropli" },
  { one: "czopek", few: "czopki", many: "czopków" },
  { one: "dawka", few: "dawki", many: "dawek" },
  { one: "ml", few: "ml", many: "ml" },
];

// Dawka z API do wyświetlenia: (0.5, "tabletka") -> "0,5 tabletki".
// Postać spoza listy zostaje bez odmiany: (2, "ampułka") -> "2 ampułka".
export function formatDose(amount: number, form: string): string {
  const amountText = String(amount).replace(".", ",");
  const option = medicationForms.find((o) => o.one === form);
  if (!option) {
    return `${amountText} ${form}`;
  }
  return `${amountText} ${pluralize(amount, option.one, option.few, option.many)}`;
}
