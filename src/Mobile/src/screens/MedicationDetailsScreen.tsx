import { useCallback, useState } from "react";
import { Alert, Text, View } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import {
  CalendarPlus,
  CalendarX,
  Clock,
  LucideIcon,
  Pill,
} from "lucide-react-native";
import { getErrorMessage } from "../utils/errorMessage";
import ErrorState from "../components/ErrorState";
import { MedicationStack } from "../navigation/MedicationsStack";
import { MedicationResponse } from "../types/MedicationTypes";
import { MedicationScheduleResponse } from "../types/MedicationScheduleTypes";
import { medicationDelete, medicationGetOne } from "../api/medication";
import { medicationScheduleGet } from "../api/medicationSchedule";

type Props = {
  navigation: NativeStackNavigationProp<MedicationStack, "SzczegolyLeku">;
  route: RouteProp<MedicationStack, "SzczegolyLeku">;
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

export default function MedicationDetailsScreen({ navigation, route }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [medication, setMedication] = useState<MedicationResponse | null>(null);
  const [medicationSchedule, setMedicationSchedule] = useState<
    MedicationScheduleResponse[]
  >([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [medication, schedules] = await Promise.all([
        medicationGetOne(route.params.medicationId),
        medicationScheduleGet(route.params.medicationId),
      ]);
      setMedication(medication);
      setMedicationSchedule(schedules);
    } catch (e) {
      getErrorMessage(e, "Nie wolno pobrać danych");
    } finally {
      setLoading(false);
    }
  }, [route.params.medicationId]);

  // Krok 6: usuwanie (Alert -> medicationDelete -> goBack)
  async function handleDeleteExamination() {
    setLoading(true);
    try {
      await medicationDelete(route.params.medicationId);
      navigation.goBack();
    } catch (e) {
      Alert.alert("Błąd", getErrorMessage(e, "Nie udało się usunąć leku."));
    } finally {
      setLoading(false);
    }
  }

  function handleDelete() {
    Alert.alert("Usuń lek", "Czy na pewno chcesz usunąć lek?", [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Usuń",
        style: "destructive",
        onPress: handleDeleteExamination,
      },
    ]);
  }

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
        <ErrorState message={error} />
      </SafeAreaView>
    );
  }

  if (!medication) {
    return (
      <SafeAreaView className="flex-1" edges={["bottom", "left", "right"]}>
        <ErrorState message={"Brak leków do wyświetlenia"} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 m-4" edges={["bottom", "left", "right"]}>
      {/* Krok 1: test, że id dociera do ekranu — usuń po kroku 4 */}
      <Text className="text-foreground">{route.params.medicationId}</Text>

      {/* Krok 4: nazwa, dawka, daty */}
      <DetailField icon={Pill} label="Nazwa leku" value={medication.name} />
      <DetailField
        icon={CalendarPlus}
        label="Godzina"
        value={medication.startDate}
      />
      <DetailField
        icon={CalendarX}
        label="Godzina"
        value={medication.endDate}
      />

      {/* Krok 5: godziny (posortowane, .map, komunikat gdy brak) */}
    </SafeAreaView>
  );
}
