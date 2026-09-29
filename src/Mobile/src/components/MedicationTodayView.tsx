import { useCallback, useState } from "react";
import { Text, SectionList, Alert, ActivityIndicator } from "react-native";
import { TodayMedicationIntake } from "../types/MedicationIntakeTypes";
import {
  medicationIntakeCreate,
  medicationIntakeDelete,
  medicationIntakeToday,
} from "../api/medicationIntake";
import { formatDateLocal } from "../utils/dateFormat";
import { getErrorMessage } from "../utils/errorMessage";
import { useFocusEffect } from "@react-navigation/native";
import { timeOfDayLabels } from "../utils/medicationTime";
import TodayDoseRow from "./TodayDoseRow";
import ErrorState from "./ErrorState";

export default function MedicationTodayView() {
  const [doses, setDoses] = useState<TodayMedicationIntake[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const date = formatDateLocal(new Date());

    try {
      const todayDoses = await medicationIntakeToday(date);
      setDoses(todayDoses);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się pobrać dawek"));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const morningMedications = doses.filter(
    (dose) => dose.timeOfDay === "Morning",
  );

  const afternoonMedications = doses.filter(
    (dose) => dose.timeOfDay === "Afternoon",
  );

  const eveningMedications = doses.filter(
    (dose) => dose.timeOfDay === "Evening",
  );

  const beforeBedMedications = doses.filter(
    (dose) => dose.timeOfDay === "BeforeSleep",
  );

  async function handleToggle(dose: TodayMedicationIntake) {
    const date = formatDateLocal(new Date());

    try {
      if (dose.status === "Taken" && dose.intakeId) {
        await medicationIntakeDelete(dose.intakeId);
      } else {
        await medicationIntakeCreate({
          medicationScheduleId: dose.medicationScheduleId,
          date,
          status: "Taken",
        });
      }
      await load();
    } catch (e) {
      Alert.alert("Błąd", getErrorMessage(e, "Nie udało się zapisać dawki"));
    }
  }

  const sections = [
    { title: timeOfDayLabels.Morning, data: morningMedications },
    { title: timeOfDayLabels.Afternoon, data: afternoonMedications },
    { title: timeOfDayLabels.Evening, data: eveningMedications },
    { title: timeOfDayLabels.BeforeSleep, data: beforeBedMedications },
  ].filter((section) => section.data.length > 0);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.medicationScheduleId}
      className="flex-1 m-2"
      renderSectionHeader={({ section }) => (
        <Text className="uppercase text-xs font-semibold text-muted-foreground mt-4 mb-2">
          {section.title} ({section.data.length})
        </Text>
      )}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator className="mt-8" />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <Text className="text-muted-foreground text-center mt-8">
            Nie masz dziś zaplanowanych dawek.
          </Text>
        )
      }
      renderItem={({ item }) => (
        <TodayDoseRow dose={item} onToggle={() => handleToggle(item)} />
      )}
    />
  );
}
