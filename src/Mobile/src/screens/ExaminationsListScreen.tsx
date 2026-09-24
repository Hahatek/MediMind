import { useCallback, useEffect, useState } from "react";
import { FlatList, Text, Pressable, View, Alert } from "react-native";
import { getMe } from "../api/user";
import { endSession } from "../api/auth";
import ThemeSelector from "../components/ThemeSelector";
import { examinationDelete, examinationGet } from "../api/examination";
import { ExaminationResponse } from "../types/ExaminationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ExaminationStack } from "../navigation/ExaminationsStack";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trash } from "lucide-react-native";
import ExaminationCard from "../components/ExaminationCard";

type Props = {
  navigation: NativeStackNavigationProp<ExaminationStack, "Badania">;
};

// TODO: po wejściu w szczeguły badania i zmienieniu tab zawsze pojawie sie nam lista z badaniami ani nie szczegóły badan

export default function ExaminationsListScreen({ navigation }: Props) {
  const [examinationsRespons, setExaminationsRespons] = useState<
    ExaminationResponse[]
  >([]);
  const [errorE, setErrorE] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        try {
          const examinationData = await examinationGet();
          setExaminationsRespons(examinationData);
        } catch {
          setErrorE("Nie udało się pobrać badań");
        }
      }
      load();
    }, []),
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
    } catch {
      Alert.alert("Błąd", "Nie udało się usunąć badania.");
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

  return (
    <SafeAreaView className="flex-1">
      <Text className="text-foreground">BADANIA</Text>

      <FlatList
        className="flex-1 m-2"
        data={examinationsRespons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable onPress={() => handleExaminationDetails(item.id)}>
            <ExaminationCard
              name={item.name}
              location={item.location}
              date={item.date}
              color={item.color}
              status={item.status}
              time={item.time}
              onEdit={() =>
                navigation.navigate("EdytujBadanie", { examinationId: item.id })
              }
              onDelete={() => handleDelete(item.id)}
            />
          </Pressable>
          // <View>
          //<Pressable
          //     className="border-line-1 border-2 bg-surface m-3 p-4 rounded-xl flex flex-row justify-between"
          //   onPress={() => handleExaminationDetails(item.id)}
          // >
          //     <Text className="text-primary">{item.name}</Text>
          //     <Pressable onPress={() => handleDelete(item.id)}>
          //       <Trash />
          //     </Pressable>
          //   </Pressable>
          // </View>
        )}
      />
      <Pressable
        onPress={() => navigation.navigate("DodajBadanie")}
        className="text-primary-foreground mt-8 bg-neutral-600 p-2 rounded-xl"
      >
        <Text className="text-primary-foreground">Dodaj Badanie</Text>
      </Pressable>
    </SafeAreaView>
  );
}
