export function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}.${year}`;
}

export function formatTime(timeStr: string) {
  return timeStr.slice(0, 5);
}

export function formatDateLocal(d: Date) {
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const monthNumber = String(month).padStart(2, "0");
  const day = d.getDate();
  const dayNumber = String(day).padStart(2, "0");
  return `${year}-${monthNumber}-${dayNumber}`;
}

export function formatTimeLocal(t: Date) {
  const hour = t.getHours();
  const minutes = t.getMinutes();
  const hourWithZero = String(hour).padStart(2, "0");
  const minutesWithZero = String(minutes).padStart(2, "0");
  return `${hourWithZero}:${minutesWithZero}:00`;
}

// Odwrotność formatDateLocal: "2026-09-24" -> Date (czas lokalny, bez UTC).
// Pusty/niepoprawny string -> dzisiejsza data (od niej startuje kalendarz).
export function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}

// Odwrotność formatTimeLocal: "09:05:00" -> Date z dzisiejszą datą i tą godziną.
export function parseTimeLocal(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date();
  if (Number.isNaN(hours) || Number.isNaN(minutes) || timeStr === "") return d;
  d.setHours(hours, minutes, 0, 0);
  return d;
}
