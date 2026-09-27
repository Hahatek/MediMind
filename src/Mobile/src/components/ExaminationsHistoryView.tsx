import { FlatList, Text, Pressable } from "react-native";
import { ExaminationResponse } from "../types/ExaminationTypes";
import ExaminationCard from "./ExaminationCard";
import {
  examinationSectionByStatus,
  getExaminationDisplayStatus,
  getExaminationDateTime,
} from "../utils/examinationDisplayStatus";

type Props = {
  examinations: ExaminationResponse[];
  onPressExamination: (examinationId: string) => void;
};

// Widok (nie ekran) — dane pobiera ekran "Badania" i przekazuje je tutaj.
export default function ExaminationsHistoryView({
  examinations,
  onPressExamination,
}: Props) {
  const day = new Date();

  const historyExaminations = examinations
    .filter(
      (item) =>
        examinationSectionByStatus[getExaminationDisplayStatus(item, day)] ===
        "history",
    )
    .sort(
      (a, b) =>
        getExaminationDateTime(b).getTime() -
        getExaminationDateTime(a).getTime(),
    );

  return (
    <FlatList
      className="flex-1 mx-2"
      data={historyExaminations}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={
        <Text className="text-muted-foreground text-center mt-8">
          Nie masz jeszcze zakończonych badań.
        </Text>
      }
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
  );
}
