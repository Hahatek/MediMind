import { Calendar, LocaleConfig } from "react-native-calendars";
import { useThemeColor } from "../theme";
import { ExaminationResponse } from "../types/ExaminationTypes";
import { useState } from "react";
import { formatDate, formatDateLocal } from "../utils/dateFormat";
import {
  getExaminationDateTime,
  getExaminationDisplayStatus,
} from "../utils/examinationDisplayStatus";
import { Pressable, View, FlatList, Text } from "react-native";
import ExaminationCard from "./ExaminationCard";
import Button from "./Button";
import { X } from "lucide-react-native";

LocaleConfig.locales.pl = {
  monthNames: [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ],
  monthNamesShort: [
    "Sty",
    "Lut",
    "Mar",
    "Kwi",
    "Maj",
    "Cze",
    "Lip",
    "Sie",
    "Wrz",
    "Paź",
    "Lis",
    "Gru",
  ],
  dayNames: [
    "Niedziela",
    "Poniedziałek",
    "Wtorek",
    "Środa",
    "Czwartek",
    "Piątek",
    "Sobota",
  ],
  dayNamesShort: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"],
  today: "Dzisiaj",
};
LocaleConfig.defaultLocale = "pl";

type Props = {
  examinations: ExaminationResponse[];
  onPressExamination: (examinationId: string) => void;
};

export default function ExaminationsCalendarView({
  examinations,
  onPressExamination,
}: Props) {
  const surface = useThemeColor("--surface");
  const ink1 = useThemeColor("--ink-1");
  const ink3 = useThemeColor("--ink-3");
  const ink7 = useThemeColor("--ink-7");
  const brandInk = useThemeColor("--brand-ink");
  const brand = useThemeColor("--brand");
  const onBrand = useThemeColor("--on-brand");

  const [visibleMonth, setVisibleMonth] = useState(
    formatDateLocal(new Date()).slice(0, 7),
  ); // format "2026-09"
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const day = new Date();
  const monthExaminations = examinations
    .filter((item) => item.date.startsWith(visibleMonth))
    .sort(
      (a, b) =>
        getExaminationDateTime(a).getTime() -
        getExaminationDateTime(b).getTime(),
    );

  const markedDates: Record<string, { marked?: boolean; selected?: boolean }> =
    {};
  for (const examination of monthExaminations) {
    markedDates[examination.date] = { marked: true };
  }
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
    };
  }
  const listExaminations = selectedDate
    ? monthExaminations.filter((item) => item.date === selectedDate)
    : monthExaminations;

  const calendarTheme = {
    calendarBackground: surface,
    dayTextColor: ink1,
    monthTextColor: ink1,
    textDisabledColor: ink7, // dni z sąsiednich miesięcy
    textSectionTitleColor: ink3, // nagłówki Pn, Wt, Śr...
    todayTextColor: brandInk,
    arrowColor: brandInk,
    dotColor: brandInk,
    selectedDayBackgroundColor: brand,
    selectedDayTextColor: onBrand,
    selectedDotColor: onBrand,
  };

  return (
    <View className="flex-1">
      <Calendar
        firstDay={1}
        theme={calendarTheme}

        onMonthChange={(month) => {
          setVisibleMonth(month.dateString.slice(0, 7));
          setSelectedDate(null);
        }}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
      />
      {selectedDate && (
        <View className="flex-row items-center justify-between mx-2 mt-2">
          <Text className="ml-4">{formatDate(selectedDate)}</Text>
          <Button
            title="Pokaż cały miesiąc"
            iconLeft={X}
            variant="ghost"
            onPress={() => setSelectedDate(null)}
          />
        </View>
      )}
      <FlatList
        className="flex-1 mx-2"
        data={listExaminations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => onPressExamination(item.id)}>
            <ExaminationCard
              name={item.name}
              location={item.location}
              date={item.date}
              color={item.color}
              status={getExaminationDisplayStatus(item, day)}
              time={item.time}
            />
          </Pressable>
        )}
      />
    </View>
  );
}
