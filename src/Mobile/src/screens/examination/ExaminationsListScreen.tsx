import { useCallback, useEffect, useState } from "react";
import {
  Text,
  Pressable,
  View,
  Alert,
  ActivityIndicator,
  SectionList,
  Modal,
} from "react-native";

import { examinationDelete, examinationGet } from "../../api/examination";
import {
  ExaminationListParams,
  ExaminationResponse,
} from "../../types/ExaminationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ExaminationStack } from "../../navigation/ExaminationsStack";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, Plus, SlidersHorizontal } from "lucide-react-native";
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
import { FamilyMembership, PersonContext } from "../../types/FamilyTypes";
import { familyGet } from "../../api/family";
import { useThemeColor } from "../../theme/useThemeColor";

type Props = {
  navigation: NativeStackNavigationProp<ExaminationStack, "ListaBadan">;
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
  const [members, setMembers] = useState<FamilyMembership[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectIds, setSelectIds] = useState<string[]>([]);
  const checkColor = useThemeColor("--on-brand");

  function buildParams(
    person: PersonContext | undefined,
  ): ExaminationListParams {
    if (person) {
      return { userId: person.userId };
    }
    return { includeFamily: true };
  }

  let canManage = false;

  if (person == null) {
    canManage = true;
  } else {
    canManage = person.canManage;
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const examinationData = await examinationGet(buildParams(person));
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

  function canManageFor(userId: string): boolean {
    const owner = members.find((m) => m.userId === userId);
    return person ? canManage : (owner?.canManage ?? true);
  }

  function handleExaminationDetails(examinationId: string) {
    const exam = examinationsRespons.find((e) => e.id === examinationId);

    navigation.navigate("SzczegolyBadania", {
      examinationId,
      canManage: exam ? canManageFor(exam.userId) : false,
    });
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

  function toggleSelect(userId: string) {
    if (selectIds.includes(userId)) {
      if (selectIds.length <= 1) {
        Alert.alert("Filtr", "Musisz mieć zaznaczoną co najmniej jedną osobę.");
        return;
      }
      setSelectIds(selectIds.filter((id) => id !== userId));
    } else {
      setSelectIds([...selectIds, userId]);
    }
  }

  function renderPersonRow(p: FamilyMembership) {
    const isSelected = selectIds.includes(p.userId);

    return (
      <Pressable
        key={p.userId}
        className="flex-row items-center gap-3 py-3"
        onPress={() => toggleSelect(p.userId)}
      >
        <View
          className={`w-6 h-6 rounded-md border-2 items-center justify-center ${
            isSelected ? "bg-primary border-primary" : "border-line-2"
          }`}
        >
          {isSelected && <Check size={16} color={checkColor} />}
        </View>
        <Text className="text-foreground">
          {p.firstName} {p.lastName}
        </Text>
      </Pressable>
    );
  }

  const day = new Date();

  const visibleExamination =
    selectIds.length === 0
      ? examinationsRespons
      : examinationsRespons.filter((e) => selectIds.includes(e.userId));

  const myPeople = members.filter((m) => m.isMe || m.canManage);
  const otherPeople = members.filter((m) => !m.isMe && !m.canManage);

  const awaitingExaminations = visibleExamination
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

  const upcomingExaminations = visibleExamination
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

  useEffect(() => {
    if (person) {
      return;
    }

    async function loadMembers() {
      try {
        const response = (await familyGet())
          .flatMap((family) => family.members)
          .filter(
            (item, index, array) =>
              array.findIndex((m) => m.userId === item.userId) === index,
          );
        setMembers(response);
        const me = response.find((m) => m.isMe);
        if (me) {
          setSelectIds([me.userId]);
        }
      } catch (e) {
        console.log(e);
      }
    }

    loadMembers();
  }, [person]);

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
            <Text className="text-foreground">
              {section.title} ({section.data.length})
            </Text>
          )}
          renderItem={({ item }) => {
            const canManageItem = canManageFor(item.userId);
            const owner = members.find((m) => m.userId === item.userId);
            const ownerName =
              owner && !owner.isMe ? owner.firstName : undefined;

            return (
              <Pressable onPress={() => handleExaminationDetails(item.id)}>
                <ExaminationCard
                  ownerName={ownerName}
                  name={item.name}
                  location={item.location}
                  date={item.date}
                  color={item.color}
                  status={getExaminationDisplayStatus(item, day)}
                  time={item.time}
                  onEdit={
                    canManageItem
                      ? () =>
                          navigation.navigate("EdytujBadanie", {
                            examinationId: item.id,
                          })
                      : undefined
                  }
                  onDelete={
                    canManageItem ? () => handleDelete(item.id) : undefined
                  }
                />
              </Pressable>
            );
          }}
        />
      )}
      {tab === "calendar" && (
        <ExaminationsCalendarView
          examinations={visibleExamination}
          onPressExamination={handleExaminationDetails}
        />
      )}
      {tab === "history" && (
        <ExaminationsHistoryView
          examinations={visibleExamination}
          onPressExamination={handleExaminationDetails}
        />
      )}

      <View className="m-4 flex flex-row gap-2">
        {!person && (
          <View className="w-16">
            <Button
              variant="neutral"
              iconRight={SlidersHorizontal}
              onPress={() => setFilterOpen(true)}
            />
          </View>
        )}

        {canManage && (
          <View className="flex flex-1">
            <Button
              title={"Dodaj badanie"}
              onPress={() => navigation.navigate("DodajBadanie")}
              iconLeft={Plus}
              variant="primary"
            />
          </View>
        )}
      </View>

      <Modal
        visible={filterOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterOpen(false)}
      >
        <Pressable
          className="flex flex-1 justify-end bg-black/40"
          onPress={() => setFilterOpen(false)}
        >
          <Pressable className="bg-surface rounded-t-2xl p-4 pb-8">
            <Text className="text-lg font-semibold text-foreground">
              Filtr badań
            </Text>
            <View>
              <Text className="text-xs text-ink-3 mt-4 mb-2">
                Ty i osoby pod twoją opieką
              </Text>
              {myPeople.map(renderPersonRow)}
            </View>
            <View>
              <Text className="text-xs text-ink-3 mt-4 mb-2">
                Pozostali członkowie rodziny
              </Text>
              {otherPeople.map(renderPersonRow)}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
