// Backend przechowuje odstęp badania cyklicznego zawsze w MIESIĄCACH
// (CycleInterval, Google Calendar: FREQ=MONTHLY;INTERVAL=n).
// Jednostka "lata" istnieje tylko w UI — przy zapisie przeliczamy na miesiące.

export type CycleUnit = "months" | "years";

export const cycleUnitLabels: Record<CycleUnit, string> = {
  months: "Miesiące",
  years: "Lata",
};

/** Tekst z pola -> dodatnia liczba całkowita, albo null gdy wpis jest niepoprawny ("", "0", "abc", "1.5"). */
export function parseCycleValue(text: string): number | null {
  const n = Number(text);
  return Number.isInteger(n) && n >= 1 ? n : null;
}

/** Wartość w wybranej jednostce -> miesiące (to, co idzie do API). */
export function toMonths(value: number, unit: CycleUnit): number {
  return unit === "years" ? value * 12 : value;
}

/** Miesiące z API -> wartość + jednostka do wypełnienia formularza (np. w edycji). */
export function fromMonths(months: number): { value: number; unit: CycleUnit } {
  if (months % 12 === 0) {
    return { value: months / 12, unit: "years" };
  }
  return { value: months, unit: "months" };
}

// Polska odmiana: 1 miesiąc, 2-4 miesiące (poza 12-14), 5+ miesięcy.
function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) {
    return few;
  }
  return many;
}

/** Miesiące z API -> tekst do wyświetlenia, np. "co miesiąc", "co 3 miesiące", "co 2 lata". */
export function formatCycleInterval(months: number): string {
  const { value, unit } = fromMonths(months);
  if (unit === "years") {
    return value === 1 ? "co rok" : `co ${value} ${plural(value, "rok", "lata", "lat")}`;
  }
  return value === 1
    ? "co miesiąc"
    : `co ${value} ${plural(value, "miesiąc", "miesiące", "miesięcy")}`;
}
