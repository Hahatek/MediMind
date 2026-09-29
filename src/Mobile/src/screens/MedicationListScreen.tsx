import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MedicationStack } from "../navigation/MedicationsStack";
import { MedicationListItem } from "../types/MedicationTypes";
import { useCallback, useState } from "react";
import { medicationGet } from "../api/medication";
import { getErrorMessage } from "../utils/errorMessage";
import { formatDateLocal } from "../utils/dateFormat";
import { useFocusEffect } from "@react-navigation/native";
import ErrorState from "../components/ErrorState";
import MedicationCard from "../components/MedicationCard";
import Button from "../components/Button";
import { Plus } from "lucide-react-native";
import { pluralize } from "../utils/pluralize";
import SegmentedControl from "../components/SegmentedControl";
import MedicationTodayView from "../components/MedicationTodayView";

type Props = {
  navigation: NativeStackNavigationProp<MedicationStack, "Leki">;
};

const TABS = [
  { value: "today", label: "Dziś" },
  { value: "leki", label: "Lista leków" },
];

export default function MedicationListScreen({ navigation }: Props) {
  const [medicationResponse, setMedicationResponse] = useState<
    MedicationListItem[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("today");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const medicationData = await medicationGet({
        date: formatDateLocal(new Date()),
      });
      setMedicationResponse(medicationData);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się pobrać leków"));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function handleMedicationDetails(medicationId: string) {
    navigation.navigate("SzczegolyLeku", { medicationId });
  }

  return (
    <SafeAreaView className="flex-1 m-4" edges={["bottom", "left", "right"]}>
      <View>
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      </View>
      {tab === "leki" && (
        <>
          {error && <ErrorState message={error} onRetry={load} />}
          <View className="flex-1 justify-center">
            <FlatList
              data={medicationResponse}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                loading ? (
                  <ActivityIndicator className="mt-8" />
                ) : error ? null : (
                  <Text className="text-muted-foreground text-center mt-8">
                    Nie masz podanych leków
                  </Text>
                )
              }
              ListHeaderComponent={
                medicationResponse.length ? (
                  <Text className="text-muted-foreground text-xs">
                    Przyjmujesz {medicationResponse.length}{" "}
                    {pluralize(
                      medicationResponse.length,
                      "lek",
                      "leki",
                      "leków",
                    )}
                  </Text>
                ) : null
              }
              renderItem={({ item }) => (
                <Pressable onPress={() => handleMedicationDetails(item.id)}>
                  <MedicationCard
                    name={item.name}
                    strength={item.strength}
                    form={item.form}
                    schedules={item.schedules}
                    notes={item.notes}
                    onEdit={() =>
                      navigation.navigate("EdytujLek", {
                        medicationId: item.id,
                      })
                    }
                  />
                </Pressable>
              )}
            />
          </View>
          <View className="">
            <Button
              title="Dodaj lek"
              variant="primary"
              iconLeft={Plus}
              onPress={() => navigation.navigate("DodajLek")}
            />
          </View>
        </>
      )}
      {tab === "today" && <MedicationTodayView />}
    </SafeAreaView>
  );
}
