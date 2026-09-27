import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MedicationStack } from "../navigation/MedicationsStack";
import { MedicationResponse } from "../types/MedicationTypes";
import { useCallback, useEffect, useState } from "react";
import { medicationGet } from "../api/medication";
import { getErrorMessage } from "../utils/errorMessage";
import { useFocusEffect } from "@react-navigation/native";
import ErrorState from "../components/ErrorState";
import MedicationCard from "../components/MedicationCard";
import { LucideIcon } from "lucide-react-native";

type Props = {
  navigation: NativeStackNavigationProp<MedicationStack, "Leki">;
};

export default function MedicationListScreen({ navigation }: Props) {
  const [medicationResponse, setMedicationResponse] = useState<
    MedicationResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const medicationData = await medicationGet();
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
    <SafeAreaView className="flex-1">
      {error && <ErrorState message={error} onRetry={load} />}
      {/* <View className="flex justify-center items-center"> */}
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
        renderItem={({ item }) => (
          <Pressable onPress={() => handleMedicationDetails(item.id)}>
            <MedicationCard name={item.name} dose={item.dose} />
          </Pressable>
        )}
      />
      {/* </View> */}
    </SafeAreaView>
  );
}
