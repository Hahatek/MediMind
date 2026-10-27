import { useCallback, useState } from "react";
import { Text, View, Alert, ScrollView } from "react-native";
import {
  examinationComplete,
  examinationDelete,
  examinationGetOne,
  examinationSkip,
} from "../../api/examination";
import { ExaminationResponse } from "../../types/ExaminationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ExaminationStack } from "../../navigation/ExaminationsStack";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import {
  Building2,
  CalendarPlus,
  CircleCheck,
  CircleSlash,
  Flag,
  LucideIcon,
  Info,
  Repeat,
  Trash,
  Pencil,
  User,
} from "lucide-react-native";
import { formatCycleInterval } from "../../utils/cycleInterval";
import { getErrorMessage } from "../../utils/errorMessage";
import ErrorState from "../../components/ErrorState";
import Button from "../../components/Button";
import {
  canSkipExamination,
  getExaminationDisplayStatus,
} from "../../utils/examinationDisplayStatus";
import { getExamStatusStyle } from "../../theme/examStatus";
import {
  formatDate,
  formatDateLocal,
  formatTime,
} from "../../utils/dateFormat";
import { useThemeColor } from "../../theme/useThemeColor";
import { typography } from "../../theme/typography";

type Props = {
  navigation: NativeStackNavigationProp<ExaminationStack, "SzczegolyBadania">;
  route: RouteProp<ExaminationStack, "SzczegolyBadania">;
};

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getNextDate(dateStr: string, cycleIntervalMonths: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const target = new Date(year, month - 1 + cycleIntervalMonths, 1);
  const daysInTargetMonth = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();
  target.setDate(Math.min(day, daysInTargetMonth));
  return formatDate(formatDateLocal(target));
}

function DetailRow({
  icon: Icon,
  label,
  value,
  last = false,
}: {
  icon: LucideIcon;
  label: string;
  value?: string | null;
  last?: boolean;
}) {
  const iconColor = useThemeColor("--ink-3");
  return (
    <View
      className={`flex flex-row items-center px-4 py-3 gap-3 ${!last ? "border-b border-line-2" : ""}`}
    >
      <Icon size={18} color={iconColor} />
      <Text className="text-ink-3 flex-1" style={typography.meta}>
        {label}
      </Text>
      <Text className="text-foreground shrink" style={typography["row.label"]}>
        {value ?? "brak"}
      </Text>
    </View>
  );
}

export default function ExaminationDetailsScreen({ navigation, route }: Props) {
  const canManage = route.params.canManage;
  const [examinationData, setExaminationData] =
    useState<ExaminationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const day = new Date();

  const brandColor = useThemeColor("--brand");
  const color = useThemeColor("--foreground");
  const dataExamination = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await examinationGetOne(route.params.examinationId);
      setExaminationData(response);
    } catch (e) {
      setError(
        getErrorMessage(e, "Nie udało się wczytać informacji o badaniu"),
      );
    } finally {
      setLoading(false);
    }
  }, [route.params.examinationId]);

  useFocusEffect(
    useCallback(() => {
      dataExamination();
    }, [dataExamination]),
  );

  async function handleDeleteExamination() {
    setLoading(true);
    try {
      await examinationDelete(route.params.examinationId);
      navigation.goBack();
    } catch (e) {
      Alert.alert("Błąd", getErrorMessage(e, "Nie udało się usunąć badania."));
    } finally {
      setLoading(false);
    }
  }

  function handleDelete() {
    Alert.alert("Usuń badanie", "Czy na pewno chcesz usunąć badanie?", [
      { text: "Anuluj", style: "cancel" },
      { text: "Usuń", style: "destructive", onPress: handleDeleteExamination },
    ]);
  }

  async function handleConfirmExamination() {
    setConfirming(true);
    try {
      const response = await examinationComplete(route.params.examinationId);
      setExaminationData(response);
    } catch (e) {
      Alert.alert(
        "Błąd",
        getErrorMessage(
          e,
          "Nie udało się potwierdzić odbycia terminu badania.",
        ),
      );
    } finally {
      setConfirming(false);
    }
  }

  function handleConfirm() {
    Alert.alert("Potwierdzenie badania", "Czy potwierdzasz odbycie badania?", [
      { text: "Anuluj", style: "cancel" },
      { text: "Tak", style: "default", onPress: handleConfirmExamination },
    ]);
  }

  async function handleSkipExamination() {
    setSkipping(true);
    try {
      const response = await examinationSkip(route.params.examinationId);
      setExaminationData(response);
    } catch (e) {
      Alert.alert(
        "Błąd",
        getErrorMessage(e, "Nie udało się oznaczyć badania jako ominiętego."),
      );
    } finally {
      setSkipping(false);
    }
  }

  function handleSkip() {
    Alert.alert(
      "Ominięte badanie",
      "Czy na pewno oznaczyć badanie jako ominięte?",
      [
        { text: "Anuluj", style: "cancel" },
        { text: "Tak", style: "default", onPress: handleSkipExamination },
      ],
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1" edges={["bottom", "left", "right"]}>
        <Text className="text-foreground p-4" style={typography.body}>
          Ładowanie...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1" edges={["bottom", "left", "right"]}>
        <ErrorState message={error} onRetry={dataExamination} />
      </SafeAreaView>
    );
  }

  if (!examinationData) {
    return null;
  }

  const displayStatus = getExaminationDisplayStatus(examinationData, day);
  const statusStyle = getExamStatusStyle(displayStatus);
  const canSkip = canSkipExamination(examinationData, day);

  return (
    <SafeAreaView
      className="flex-1 bg-screen"
      edges={["bottom", "left", "right"]}
    >
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* Tytuł + status */}
        <View className="flex flex-row justify-between items-start mb-4">
          <Text
            className="text-foreground flex-1 mr-3"
            style={typography["title.detail"]}
          >
            {examinationData.name}
          </Text>
          <View
            className={`px-3 py-1 rounded-full mt-1 ${statusStyle.container}`}
          >
            <Text className={statusStyle.text} style={typography.badge}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        {/* Data i godzina */}
        <View className="rounded-xl bg-surface border border-line-2 flex flex-row mb-3 overflow-hidden">
          <View className="flex-1 p-4">
            <Text className="text-ink-3 mb-1" style={typography.caption}>
              Data
            </Text>
            <Text
              className="text-foreground"
              style={typography["detail.dateTime"]}
            >
              {formatDate(examinationData.date)}
            </Text>
          </View>
          <View className="w-px bg-line-2" />
          <View className="flex-1 p-4">
            <Text className="text-ink-3 mb-1" style={typography.caption}>
              Godzina
            </Text>
            <Text
              className="text-foreground"
              style={typography["detail.dateTime"]}
            >
              {examinationData.time ? formatTime(examinationData.time) : "—"}
            </Text>
          </View>
        </View>

        {/* Badanie cykliczne */}
        {examinationData.isCyclic && examinationData.cycleInterval != null && (
          <View className="rounded-xl bg-tint-2 p-4 mb-3 flex flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-full bg-surface items-center justify-center">
              <Repeat size={20} color={brandColor} />
            </View>
            <View className="flex-1">
              <Text className="text-ink-3 mb-0.5" style={typography.caption}>
                Badanie cykliczne
              </Text>
              <Text className="text-foreground" style={typography["row.label"]}>
                {capitalize(formatCycleInterval(examinationData.cycleInterval))}
              </Text>
              <Text className="text-ink-3 mt-0.5" style={typography.caption}>
                Następne:{" "}
                {getNextDate(
                  examinationData.date,
                  examinationData.cycleInterval,
                )}
              </Text>
            </View>
          </View>
        )}

        {/* Przygotowanie */}
        {examinationData.preparation && (
          <View className="rounded-xl bg-surface border border-border p-4 mb-3">
            <View className="flex flex-row items-center gap-2 mb-2">
              <Info size={16} color={color} />
              <Text className="text-foreground" style={typography["row.label"]}>
                Przygotowanie
              </Text>
            </View>
            <Text className="text-foreground" style={typography["body.sm"]}>
              {examinationData.preparation}
            </Text>
          </View>
        )}

        {/* Szczegóły */}
        <View className="rounded-xl bg-surface border border-line-2 overflow-hidden mb-3">
          <DetailRow
            icon={Building2}
            label="Placówka"
            value={examinationData.location}
          />
          <DetailRow
            icon={User}
            label="Lekarz"
            value={examinationData.doctor}
          />
          <DetailRow
            icon={Flag}
            label="Opis"
            value={examinationData.description}
            last
          />
        </View>
      </ScrollView>

      {/* Przyciski na dole */}
      {canManage && (
        <View className="px-4 pt-2 pb-2 gap-2">
          {displayStatus === "awaitingConfirmation" && (
            <View className="flex flex-row justify-between gap-2">
              <View className="flex-1">
                <Button
                  title="Potwierdź odbycie badania"
                  onPress={handleConfirm}
                  loading={confirming}
                  loadingTitle="Potwierdzanie..."
                  iconLeft={CircleCheck}
                  disabled={skipping}
                />
              </View>
              {canSkip && (
                <View className="flex-1">
                  <Button
                    title="Oznacz jako ominięte"
                    onPress={handleSkip}
                    loading={skipping}
                    loadingTitle="Zapisywanie..."
                    iconLeft={CircleSlash}
                    variant="neutral"
                    disabled={confirming}
                  />
                </View>
              )}
            </View>
          )}
          {examinationData.isCyclic && examinationData.seriesId && (
            <Button
              title="Zaplanuj kolejny termin"
              onPress={() =>
                navigation.navigate("DodajBadanie", {
                  previous: examinationData,
                })
              }
              iconLeft={CalendarPlus}
              variant="neutral"
            />
          )}
          <View className="flex flex-row gap-2">
            <View className="flex-1">
              <Button
                title="Edytuj"
                onPress={() =>
                  navigation.navigate("EdytujBadanie", {
                    examinationId: route.params.examinationId,
                  })
                }
                iconLeft={Pencil}
                variant="neutral"
              />
            </View>
            <View className="flex-1">
              <Button
                title="Usuń"
                onPress={handleDelete}
                iconLeft={Trash}
                variant="danger"
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
