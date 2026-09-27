import { useCallback, useEffect, useState } from "react";
import { Text, View, Pressable, Alert } from "react-native";
import {
  examinationComplete,
  examinationDelete,
  examinationGetOne,
} from "../api/examination";
import { ExaminationResponse } from "../types/ExaminationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ExaminationStack } from "../navigation/ExaminationsStack";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import {
  Clock,
  Hospital,
  LucideIcon,
  User,
  SquareText,
  Trash,
  Repeat,
  Pencil,
} from "lucide-react-native";
import { formatCycleInterval } from "../utils/cycleInterval";
import { getErrorMessage } from "../utils/errorMessage";
import ErrorState from "../components/ErrorState";
import Button from "../components/Button";
import { getExaminationDisplayStatus } from "../utils/examinationDisplayStatus";
import { getExamStatusStyle } from "../theme/examStatus";

type Props = {
  navigation: NativeStackNavigationProp<ExaminationStack, "SzczegolyBadania">;
  route: RouteProp<ExaminationStack, "SzczegolyBadania">;
};

function DetailField({
  icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value?: string | null;
}) {
  const Icon = icon;
  return (
    <View className="flex flex-row items-center">
      <Icon size={24} />
      <Text className="text-foreground mb-2">
        {label}: {value ?? "Nie podano"}
      </Text>
    </View>
  );
}

export default function ExaminationDetailsScreen({ navigation, route }: Props) {
  const [examinationData, setExaminationData] =
    useState<ExaminationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const day = new Date();

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
      {
        text: "Usuń",
        style: "destructive",
        onPress: handleDeleteExamination,
      },
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
      {
        text: "Tak",
        style: "default",
        onPress: handleConfirmExamination,
      },
    ]);
  }

  // Guard clauses odrzucamy przypadki, w których nie możemy kontynuować. Potem piszemy główną logikę bez niepotrzebnych zagnieżdżeń.
  if (loading) {
    return (
      <SafeAreaView className="flex-1" edges={["bottom", "left", "right"]}>
        <Text className="text-foreground">Ładowanie...</Text>
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

  // Liczone po guardach — tu examinationData na pewno nie jest null.
  const displayStatus = getExaminationDisplayStatus(examinationData, day);
  const statusStyle = getExamStatusStyle(displayStatus);

  return (
    <SafeAreaView className="flex-1 m-4" edges={["bottom", "left", "right"]}>
      <View className="flex flex-row justify-between items-center">
        <Text className="text-foreground text-xl p-2 mb-2">
          {examinationData.name}
        </Text>
        <View className={`px-3 py-1 rounded-full ${statusStyle.container}`}>
          <Text className={statusStyle.text}>{statusStyle.label}</Text>
        </View>
      </View>
      <Text className="text-foreground border-b-2 p-2 mb-2">
        {examinationData.date}
      </Text>
      <DetailField
        icon={Hospital}
        label="Lokalizacja"
        value={examinationData.location}
      />
      <DetailField icon={Clock} label="Godzina" value={examinationData.time} />
      <DetailField icon={User} label="Lekarz" value={examinationData.doctor} />
      <DetailField
        icon={SquareText}
        label="Przygotowanie"
        value={examinationData.preparation}
      />
      {examinationData.isCyclic && examinationData.cycleInterval != null && (
        <DetailField
          icon={Repeat}
          label="Cykliczność"
          value={formatCycleInterval(examinationData.cycleInterval)}
        />
      )}
      <View className="mt-20 flex flex-row justify-between">
        <Button
          title="Edytuj Badanie"
          onPress={() =>
            navigation.navigate("EdytujBadanie", {
              examinationId: route.params.examinationId,
            })
          }
          iconLeft={Pencil}
        />

        <Button
          title="Usuń badanie"
          onPress={handleDelete}
          iconLeft={Trash}
          variant="danger"
        />
      </View>

      <View className="mt-4">
        {displayStatus === "awaitingConfirmation" && (
          <Button
            title="Potwierdź odbycie badania"
            onPress={handleConfirm}
            disabled={confirming}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
