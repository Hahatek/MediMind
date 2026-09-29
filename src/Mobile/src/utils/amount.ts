export function parseAmount(text: string): number | null {
  const value = Number(text.replace(",", "."));

  if (Number.isNaN(value) || value <= 0) {
    return null;
  }

  return value;
}
