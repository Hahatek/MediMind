import { MedicationTime } from "../types/EnumTypes";

// Polska nazwa pory dnia — karta leku, formularz, później ekran „Dziś”.
export const timeOfDayLabels: Record<MedicationTime, string> = {
  Morning: "Rano",
  Afternoon: "Popołudnie",
  Evening: "Wieczór",
  BeforeSleep: "Przed snem",
};

// Pory dnia nie wybiera użytkownik — wyliczamy ją z godziny ("HH:mm:ss" albo "HH:mm").
// 05:00–11:59 Morning, 12:00–16:59 Afternoon, 17:00–21:59 Evening, 22:00–04:59 BeforeSleep (noc).
export function getMedicationTimeOfDay(time: string): MedicationTime {
  const hour = Number(time.slice(0, 2));

  if (hour >= 5 && hour < 12) {
    return "Morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Afternoon";
  }

  if (hour >= 17 && hour < 22) {
    return "Evening";
  }

  return "BeforeSleep";
}
