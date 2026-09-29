export function pluralize(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  if (!Number.isInteger(count)) {
    return few;
  }

  if (count === 1) {
    return one;
  }

  const ostaniaCyfra = count % 10;
  const ostanieDwieCyfry = count % 100;

  if (
    ostaniaCyfra >= 2 &&
    ostaniaCyfra <= 4 &&
    (ostanieDwieCyfry < 12 || ostanieDwieCyfry > 14)
  ) {
    return few;
  }

  return many;
}
