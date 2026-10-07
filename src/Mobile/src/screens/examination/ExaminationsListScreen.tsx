import { useCallback, useState } from "react";
import {
  Text,
  Pressable,
  View,
  Alert,
  ActivityIndicator,
  SectionList,
} from "react-native";

import { examinationDelete, examinationGet } from "../../api/examination";
import { ExaminationResponse } from "../../types/ExaminationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ExaminationStack } from "../../navigation/ExaminationsStack";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import ExaminationCard from "../../components/ExaminationCard";
import ErrorState from "../../components/ErrorState";
import { getErrorMessage } from "../../utils/errorMessage";
import Button from "../../components/Button";
import {
  examinationSectionByStatus,
  getExaminationDisplayStatus,
  getExaminationDateTime,
} from "../../utils/examinationDisplayStatus";
import SegmentedControl from "../../components/SegmentedControl";
import ExaminationsHistoryView from "../../components/ExaminationsHistoryView";
import ExaminationsCalendarView from "../../components/ExaminationsCalendarView";
import { PersonContext } from "../../types/FamilyTypes";

type Props = {
  navigation: NativeStackNavigationProp<ExaminationStack, "Badania">;
  person?: PersonContext;
};

const TABS = [
  { value: "list", label: "Lista" },
  { value: "calendar", label: "Kalendarz" },
  { value: "history", label: "Historia" },
];

export default function ExaminationsListScreen({ navigation, person }: Props) {
  const [examinationsRespons, setExaminationsRespons] = useState<
    ExaminationResponse[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("list");

  let canManage = false;

  if (person == null) {
    canManage = true;
  } else {
    canManage = person.canManage;
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const examinationData = await examinationGet(
        person ? { userId: person.userId } : {},
      );
      setExaminationsRespons(examinationData);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się pobrać badań"));
    } finally {
      setLoading(false);
    }
  }, [person?.userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function handleExaminationDetails(examinationId: string) {
    navigation.navigate("SzczegolyBadania", { examinationId });
  }

  async function handleDeleteExamination(examinationId: string) {
    try {
      await examinationDelete(examinationId);
      setExaminationsRespons((prev) =>
        prev.filter((e) => e.id !== examinationId),
      );
    } catch (e) {
      Alert.alert("Błąd", getErrorMessage(e, "Nie udało się usunąć badania."));
    }
  }

  function handleDelete(examinationId: string) {
    Alert.alert("Usuń badanie", "Czy na pewno chcesz usunąć badanie?", [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Usuń",
        style: "destructive",
        onPress: () => handleDeleteExamination(examinationId),
      },
    ]);
  }

  const day = new Date();

  const awaitingExaminations = examinationsRespons
    .filter(
      (item) =>
        examinationSectionByStatus[getExaminationDisplayStatus(item, day)] ===
        "awaitingConfirmation",
    )
    .sort(
      (a, b) =>
        getExaminationDateTime(a).getTime() -
        getExaminationDateTime(b).getTime(),
    );

  const upcomingExaminations = examinationsRespons
    .filter(
      (item) =>
        examinationSectionByStatus[getExaminationDisplayStatus(item, day)] ===
        "upcoming",
    )
    .sort(
      (a, b) =>
        getExaminationDateTime(a).getTime() -
        getExaminationDateTime(b).getTime(),
    );

  const sections = [
    { title: "Do potwierdzenia", data: awaitingExaminations },
    { title: "Nadchodzące", data: upcomingExaminations },
  ].filter((section) => section.data.length > 0);

  return (
    <SafeAreaView className="flex-1 mt-4" edges={["bottom", "left", "right"]}>
      {error && <ErrorState message={error} onRetry={load} />}
      <View>
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      </View>
      {tab === "list" && (
        <SectionList
          className="flex-1 m-2"
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator className="mt-8" />
            ) : error ? null : (
              <Text className="text-muted-foreground text-center mt-8 ">
                Nie masz jeszcze żadnych badań. Dodaj pierwsze poniżej.
              </Text>
            )
          }
          renderSectionHeader={({ section }) => (
            <Text>
              {section.title} ({section.data.length})
            </Text>
          )}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleExaminationDetails(item.id)}>
              <ExaminationCard
                name={item.name}
                location={item.location}
                date={item.date}
                color={item.color}
                status={getExaminationDisplayStatus(item, day)}
                time={item.time}
                onEdit={
                  canManage
                    ? () =>
                        navigation.navigate("EdytujBadanie", {
                          examinationId: item.id,
                        })
                    : undefined
                }
                onDelete={canManage ? () => handleDelete(item.id) : undefined}
              />
            </Pressable>
          )}
        />
      )}
      {tab === "calendar" && (
        <ExaminationsCalendarView
          examinations={examinationsRespons}
          onPressExamination={handleExaminationDetails}
        />
      )}
      {tab === "history" && (
        <ExaminationsHistoryView
          examinations={examinationsRespons}
          onPressExamination={handleExaminationDetails}
        />
      )}

      {canManage && (
        <View className="m-4">
          <Button
            title={"Dodaj badanie"}
            onPress={() => navigation.navigate("DodajBadanie")}
            iconLeft={Plus}
            variant="primary"
          />
        </View>
      )}
    </SafeAreaView>
  );
}
