import { useCallback, useEffect, useState } from "react";
import { Text, View, Pressable, Alert } from "react-native";
import { examinationDelete, examinationGetOne } from "../api/examination";
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
} from "lucide-react-native";

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
    <View>
      <Icon size={16} />
      <Text className="text-foreground border-b-2 p-2 mb-2">
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

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      async function dataExamination() {
        try {
          const response = await examinationGetOne(route.params.examinationId);
          setExaminationData(response);
        } catch {
          setError("Nie udało się wczytać informacji o badaniu");
        } finally {
          setLoading(false);
        }
      }
      dataExamination();
    }, [route.params.examinationId]),
  );

  async function handleDeleteExamination() {
    setLoading(true);
    try {
      await examinationDelete(route.params.examinationId);
      navigation.goBack();
    } catch {
      Alert.alert("Błąd", "Nie udało się usunąć badania.");
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

  // Guard clauses odrzucamy przypadki, w których nie możemy kontynuować. Potem piszemy główną logikę bez niepotrzebnych zagnieżdżeń.
  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <Text className="text-foreground">Ładowanie...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1">
        <Text className="text-foreground">{error}</Text>
      </SafeAreaView>
    );
  }

  if (!examinationData) {
    return null;
  }
  return (
    <SafeAreaView className="flex-1">
      <Text className="text-foreground text-xl border-b-2 p-2 mb-2">
        {examinationData.name}
      </Text>
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
        label="Opis"
        value={examinationData.description}
      />
      <View className="mt-20 flex flex-row justify-between">
        <Pressable
          className="p-4 border-line-2 "
          onPress={() =>
            navigation.navigate("EdytujBadanie", {
              examinationId: route.params.examinationId,
            })
          }
        >
          <Text>Edytuj Badaine</Text>
        </Pressable>
        <Pressable onPress={handleDelete}>
          <Trash />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
