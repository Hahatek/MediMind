import { tool } from "ai";
import { z } from "zod";
import { examinationGet } from "../api/examination";
import { getUpcomingExaminations } from "../utils/examinationDisplayStatus";
import { formatDate, formatDateLocal, formatTime } from "../utils/dateFormat";
import { familyGet } from "../api/family";
import { FamilyMembership } from "../types/FamilyTypes";
import { medicationIntakeToday } from "../api/medicationIntake";
import { TodayIntakeStatus } from "../types/EnumTypes";
import { timeOfDayLabels } from "../utils/medicationTime";

let rodzina: FamilyMembership[] = [];

const statusLabelsMedications: Record<TodayIntakeStatus, string> = {
  Pending: "do wzięcia",
  Taken: "wzięty",
  Skipped: "pominięty",
}

export async function loadFamily() {
  const families = await familyGet();
  rodzina = families
    .flatMap((f) => f.members)
    .filter((m, i, all) => all.findIndex((x) => x.userId === m.userId) === i);

  return rodzina;
}

function znajdzOsobe(osoba?: string) {
  if (!osoba) {
    return { userId: undefined };
  }

  const person = rodzina.find(
    (m) => m.firstName.toLowerCase() === osoba.toLowerCase(),
  );

  if (!person) {
    return { blad: "Nie ma takiej osoby w rodzinie" };
  }

  if (person.isMe) {
    return { userId: undefined };
  }

  if (!person.canManage) {
    return { blad: "Brak dostępu do danych tej osoby" };
  }

  return { userId: person.userId };
}

export const badania = tool({
  description:
    "Zwraca najbliższe nadchodzące badania użytkownika albo osoby z rodziny",
  inputSchema: z.object({
    osoba: z
      .string()
      .optional()
      .describe("Imię osoby z rodziny. Puste = użytkownik"),
  }),
  execute: async ({ osoba }) => {
    const wynik = znajdzOsobe(osoba);
    if ("blad" in wynik) {
      return wynik;
    }

    const list = await examinationGet({ userId: wynik.userId });
    const upcoming = getUpcomingExaminations(list, new Date()).slice(0, 5);
    return upcoming.map((e) => ({
      nazwa: e.name,
      data: formatDate(e.date),
      godzina: e.time ? formatTime(e.time) : null,
    }));
  },
});

export const leki = tool({
  description:
    "Zwraca dzisiejszy plan leków użytkownika albo osoby z rodziny: lek, porę dnia, ilość i czy dawka jest już wzięta",
  inputSchema: z.object({
    osoba: z
      .string()
      .optional()
      .describe("Imię osoby z rodziny. Puste = użytkownik"),
  }),
  execute: async ({ osoba }) => {
    const wynik = znajdzOsobe(osoba);
    if ("blad" in wynik) {
      return wynik;
    }

    const date = formatDateLocal(new Date())
    const list = await medicationIntakeToday(date,  wynik.userId );

    if (list.length === 0) {
      return { info: "Brak leków na dziś" }
    }

    return list.map((d) => ({
      lek: d.medicationName,
      moc: d.strength,
      ile: `${d.amount} ${d.form}`,
      pora: timeOfDayLabels[d.timeOfDay],
      godzina: d.time,
      status: statusLabelsMedications[d.status],
      uwagi: d.notes,
    }));
  },
});

