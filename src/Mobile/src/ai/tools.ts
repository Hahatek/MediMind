import { tool } from "ai";
import { z } from "zod";
import { examinationGet } from "../api/examination";
import { ExaminationResponse } from "../types/ExaminationTypes";
import {
  canSkipExamination,
  getExaminationDateTime,
  getExaminationDisplayStatus,
  getUpcomingExaminations,
} from "../utils/examinationDisplayStatus";
import { formatDate, formatDateLocal, formatTime } from "../utils/dateFormat";
import { familyGet } from "../api/family";
import { FamilyMembership } from "../types/FamilyTypes";
import { medicationIntakeToday } from "../api/medicationIntake";
import { MedicationTime, TodayIntakeStatus } from "../types/EnumTypes";
import { TodayMedicationIntake } from "../types/MedicationIntakeTypes";
import {
  getMedicationTimeOfDay,
  timeOfDayLabels,
} from "../utils/medicationTime";
import { CreateMedication } from "../types/MedicationTypes";

let rodzina: FamilyMembership[] = [];

type PropozycjaBadania = {
  name: string;
  date: string;
  time: string | null;
  forUserId?: string;
  ownerName?: string;
  cycleInterval?: number;
};

let propozycja: PropozycjaBadania | null = null;

export function takePropozycja() {
  const p = propozycja;
  propozycja = null;
  return p;
}

type DawkaDoPotwierdzenia = {
  intake: TodayMedicationIntake;
  status: "Taken" | "Skipped";
  date: string;
  ownerName?: string;
};

let dawka: DawkaDoPotwierdzenia | null = null;

export function takeDawka() {
  const d = dawka;
  dawka = null;
  return d;
}

const PORY: Record<string, MedicationTime> = {
  rano: "Morning",
  popołudnie: "Afternoon",
  wieczór: "Evening",
  "przed snem": "BeforeSleep",
};

type OznaczenieBadania = {
  examination: ExaminationResponse;
  akcja: "wykonane" | "pominiete";
  ownerName?: string;
};

let oznaczenie: OznaczenieBadania | null = null;

type PozycjaLeku = CreateMedication & { ownerName?: string };

let lek: PozycjaLeku | null = null;

export function takeLek() {
  const l = lek;
  lek = null;
  return l;
}

export function takeOznaczenie() {
  const o = oznaczenie;
  oznaczenie = null;
  return o;
}

const statusLabelsMedications: Record<TodayIntakeStatus, string> = {
  Pending: "do wzięcia",
  Taken: "wzięty",
  Skipped: "pominięty",
};

export async function loadFamily() {
  const families = await familyGet();
  rodzina = families
    .flatMap((f) => f.members)
    .filter((m, i, all) => all.findIndex((x) => x.userId === m.userId) === i);

  return rodzina;
}

function znajdzOsobe(osoba?: string | null) {
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

    const date = formatDateLocal(new Date());
    const list = await medicationIntakeToday(date, wynik.userId);

    if (list.length === 0) {
      return { info: "Brak leków na dziś" };
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

export const dodajBadanie = tool({
  description:
    "Przygotowuje nowe badanie do dodania. Użytkownik zatwierdza je przyciskiem. Wywołaj od razu, gdy znasz nazwę i datę. Godzina jest opcjonalna, nie dopytuj o nią. Gdy użytkownik nie poda roku, przyjmij najbliższą przyszłą datę.",
  inputSchema: z.object({
    nazwa: z.string().describe("Nazwa badania, np. Morfologia"),
    data: z.string().describe("Data w formacie RRRR-MM-DD"),
    godzina: z
      .string()
      .optional()
      .describe("Godzina w formacie GG:MM, tylko jeśli użytkownik ją podał"),
    osoba: z
      .string()
      .optional()
      .describe("Imię osoby z rodziny. Puste = użytkownik"),
    coIleMiesiecyBadanie: z
      .number()
      .optional()
      .describe(
        "Tylko dla badań cyklicznych: co ile miesięcy, np. co rok = 12",
      ),
  }),

  execute: async ({ nazwa, data, godzina, osoba, coIleMiesiecyBadanie }) => {
    const wynik = znajdzOsobe(osoba);
    if ("blad" in wynik) {
      return wynik;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return { blad: "Zły format daty, użyj RRRR-MM-DD" };
    }

    propozycja = {
      name: nazwa,
      date: data,
      time: godzina && /^\d{2}:\d{2}$/.test(godzina) ? `${godzina}:00` : null,
      forUserId: wynik.userId,
      ownerName: wynik.userId ? osoba : undefined,
      cycleInterval:
        coIleMiesiecyBadanie &&
        Number.isInteger(coIleMiesiecyBadanie) &&
        coIleMiesiecyBadanie >= 1
          ? coIleMiesiecyBadanie
          : undefined,
    };

    return {
      info: "Pokazano użytkownikowi kartę z badaniem. Poproś, żeby sprawdził i kliknął Dodaj.",
    };
  },
});

export const oznaczBadanie = tool({
  description:
    "Przygotowuje oznaczenie minionego badania jako wykonane albo pominięte. Użytkownik zatwierdza przyciskiem. Wywołaj od razu, gdy użytkownik mówi, że zrobił badanie albo chce je pominąć.",
  inputSchema: z.object({
    nazwa: z.string().describe("Nazwa badania, np. Morfologia"),
    akcja: z.enum(["wykonane", "pominiete"]),
    osoba: z
      .string()
      .nullish()
      .describe("Imię osoby z rodziny. Puste = użytkownik"),
  }),
  execute: async ({ nazwa, akcja, osoba }) => {
    const wynik = znajdzOsobe(osoba);
    if ("blad" in wynik) {
      return wynik;
    }

    const now = new Date();
    const list = await examinationGet({ userId: wynik.userId });
    const pasujace = list
      .filter((e) => e.name.toLowerCase().includes(nazwa.toLowerCase()))
      .filter(
        (e) => getExaminationDisplayStatus(e, now) === "awaitingConfirmation",
      )
      .sort(
        (a, b) =>
          getExaminationDateTime(b).getTime() -
          getExaminationDateTime(a).getTime(),
      );

    const badanie = pasujace[0];
    if (!badanie) {
      return {
        blad: "Nie ma minionego, niepotwierdzonego badania o tej nazwie",
      };
    }

    if (akcja === "pominiete" && !canSkipExamination(badanie, now)) {
      return { blad: "Badanie można pominąć dopiero 7 dni po terminie" };
    }

    oznaczenie = {
      examination: badanie,
      akcja,
      ownerName: wynik.userId ? (osoba ?? undefined) : undefined,
    };

    return {
      info: "Pokazano użytkownikowi kartę. Poproś, żeby sprawdził i zatwierdził przyciskiem.",
    };
  },
});

export const potwierdzDawke = tool({
  description:
    "Przygotowuje potwierdzenie dzisiejszej dawki leku jako wziętej albo pominiętej. Użytkownik zatwierdza przyciskiem. Wywołaj od razu, gdy użytkownik mówi, że wziął albo pominął lek",
  inputSchema: z.object({
    lek: z.string().describe("Nazwa leku, np. Euthyrox"),
    akcja: z.enum(["wziety", "pominiety"]),
    pora: z
      .enum(["rano", "popołudnie", "wieczór", "przed snem"])
      .nullish()
      .describe("Pora dnia, tylko jeśli użytkownik ją podał"),
    osoba: z
      .string()
      .nullish()
      .describe("Imię osoby z rodziny. Puste = użytkownik"),
  }),
  execute: async ({ lek, akcja, pora, osoba }) => {
    const wynik = znajdzOsobe(osoba);
    if ("blad" in wynik) {
      return wynik;
    }

    const date = formatDateLocal(new Date());
    const list = await medicationIntakeToday(date, wynik.userId);
    const pasujace = list
      .filter((d) => d.medicationName.toLowerCase().includes(lek.toLowerCase()))
      .filter((d) => d.status === "Pending")
      .filter((d) => !pora || d.timeOfDay === PORY[pora]);

    const wybrana = pasujace[0];
    if (!wybrana) {
      return { blad: "Nie ma dziś niepotwierdzonej dawki tego leku" };
    }

    dawka = {
      intake: wybrana,
      status: akcja === "wziety" ? "Taken" : "Skipped",
      date,
      ownerName: wynik.userId ? (osoba ?? undefined) : undefined,
    };

    return {
      info: "Pokazano użytkownikowi kartę z dawką. Poproś, żeby sprawdził i zatwierdził przyciskiem.",
    };
  },
});

export const dodajLek = tool({
  description:
    "Przygotowuje nowy lek do dodania. Użytkownik zatwierdza go przyciskiem. Wywołaj od razu, gdy znasz nazwę leku i godziny przyjmowania.",
  inputSchema: z.object({
    nazwa: z.string().describe("Nazwa leku, np. Euthyrox"),
    moc: z
      .string()
      .nullish()
      .describe("Moc, np. 50 mg, tylko jeśli użytkownik ją podał"),
    postac: z.string().nullish().describe("Postać, np. tabletka, kapsułka, ml"),
    ile: z.coerce.number().nullish().describe("Ile sztuk na raz, domyślnie 1"),
    godziny: z
      .array(z.string())
      .describe(
        'Godziny przyjmowania w formacie GG:MM, np. ["08:00", "20:00"]',
      ),
    osoba: z
      .string()
      .nullish()
      .describe("Imię osoby z rodziny. Puste = użytkownik"),
  }),

  execute: async ({ nazwa, moc, postac, ile, godziny, osoba }) => {
    const wynik = znajdzOsobe(osoba);

    if ("blad" in wynik) {
      return wynik;
    }

    const poprawne = godziny.filter((g) => /^\d{2}:\d{2}$/.test(g));
    if (poprawne.length === 0) {
      return { blad: "Podaj godziny przyjmowania w formacie GG:MM" };
    }

    lek = {
      name: nazwa,
      strength: moc ?? null,
      form: postac || "tabletka",
      startDate: formatDateLocal(new Date()),
      forUserId: wynik.userId,
      ownerName: wynik.userId ? (osoba ?? undefined) : undefined,
      schedules: poprawne.map((g) => ({
        timeOfDay: getMedicationTimeOfDay(g),
        time: `${g}:00`,
        amount: ile && ile > 0 ? ile : 1,
      })),
    };
    return {
      info: "Pokazano użytkownikowi kartę z lekiem. Poproś, żeby sprawdził i kliknął Dodaj.",
    };
  },
});

const POMOC: Record<string, string> = {
  dodawanie_badania:
    "Wejdź w zakładkę Badania i kliknij Dodaj badanie. Wpisz nazwę i datę, kliknij Dalej, uzupełnij resztę i kliknij Zapisz badanie. Możesz też poprosić mnie: Dodaj morfologię 10 grudnia.",
  potwierdzenie_badania:
    "Wejdź w zakładkę Badania, otwórz badanie i kliknij Potwierdź odbycie badania albo Oznacz jako ominięte. Pominąć można dopiero 7 dni po terminie. Możesz też napisać mi: Zrobiłem morfologię.",
  badania_cykliczne:
    "Po wykonaniu badania otwórz je i kliknij Zaplanuj kolejny termin. Kolejny termin nie tworzy się sam.",
  dodawanie_leku:
    "Wejdź w zakładkę Leki, wybierz Lista leków i kliknij Dodaj lek. Wpisz nazwę, postać i godziny przyjmowania, potem Zapisz. Możesz też poprosić mnie: Dodaj Apap Noc 1 tabletka o 22:00.",
  dawki_dzis:
    "Wejdź w zakładkę Leki, wybierz Dziś i zaznacz kwadracik przy dawce, którą wziąłeś. Możesz też napisać mi: Wziąłem Apap Noc.",
  odstawienie_leku:
    "Wejdź w zakładkę Leki, wybierz Lista leków, otwórz lek i kliknij Odstaw lek. Historia przyjęć zostaje. Odstawiony lek można wznowić przyciskiem Wznów lek.",
  rodzina:
    "Na ekranie Home kliknij Moja rodzina. Możesz utworzyć rodzinę albo dołączyć do istniejącej kodem.",
  dodawanie_czlonka:
    "Na ekranie Home kliknij Moja rodzina. Kliknij Zaproś do rodziny i Generuj kod, a potem przekaż kod tej osobie. Dla dziecka albo seniora bez telefonu kliknij Dodaj profil bez telefonu.",
  dane_czlonka:
    "Na ekranie Home kliknij Moja rodzina i wybierz osobę. W jej profilu zobaczysz jej badania i leki, jeśli masz do nich dostęp.",
  klara:
    "Mogę pokazać Twoje badania i leki na dziś, dodać badanie albo lek, oznaczyć badanie jako wykonane i potwierdzić dawkę. Każdy zapis zatwierdzasz przyciskiem. Działam na telefonie, bez internetu. Nie stawiam diagnoz i nie doradzam w leczeniu.",
};

export const pomoc = tool({
  description:
    "Zwraca instrukcje, jak coś zrobić w aplikacji MediMind. Wywołaj, gdy użytkownik pyta jak, gdzie albo co potrafisz.",
  inputSchema: z.object({
    temat: z.enum([
      "dodawanie_badania",
      "potwierdzenie_badania",
      "badania_cykliczne",
      "dodawanie_leku",
      "dawki_dzis",
      "odstawienie_leku",
      "rodzina",
      "dodawanie_czlonka",
      "dane_czlonka",
      "klara",
    ]),
  }),
  execute: async ({ temat }) => {
    return { instrukcja: POMOC[temat] };
  },
});
