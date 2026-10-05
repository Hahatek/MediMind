import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { HomeStackList } from "../navigation/HomeStack";
import { useCallback, useState } from "react";
import { FamilyDetailsResponse } from "../types/FamilyTypes";
import {
  familyCreate,
  familyDelete,
  familyGet,
  familyLeave,
} from "../api/family";
import { getErrorMessage } from "../utils/errorMessage";
import { useFocusEffect } from "@react-navigation/native";
import ErrorState from "../components/ErrorState";
import Button from "../components/Button";
import { ChevronRight } from "lucide-react-native";
import { useThemeColor } from "../theme";

type Props = {
  navigation: NativeStackNavigationProp<HomeStackList, "Rodzina">;
};

export default function FamilyScreen({ navigation }: Props) {
  const [families, setFamilies] = useState<FamilyDetailsResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chevronColor = useThemeColor("--ink-4");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const family = await familyGet();
      setFamilies(family);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się pobrać rodzin"));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleCreateFamily() {
    try {
      await familyCreate();
      await load();
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się utworzyć rodziny"));
    }
  }

  async function handleLeaveFamily(familyId: string) {
    setLoading(true);
    try {
      await familyLeave(familyId);
      await load();
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się opuścić rodziny"));
    } finally {
      setLoading(false);
    }
  }

  function confirmLeaveFamily(familyId: string) {
    Alert.alert("Opuść rodzinę", "Czy na pewno chcesz opuścić rodzinę?", [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Opuść",
        style: "destructive",
        onPress: () => handleLeaveFamily(familyId),
      },
    ]);
  }

  async function handleDeleteFamily(familyId: string) {
    setLoading(true);
    try {
      await familyDelete(familyId);
      await load();
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się usunąć rodziny"));
    } finally {
      setLoading(false);
    }
  }

  function confirmDeleteFamily(familyId: string) {
    Alert.alert("Usuń rodzinę", "Czy na pewno chcesz usunąć rodzinę?", [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Usuń",
        style: "destructive",
        onPress: () => handleDeleteFamily(familyId),
      },
    ]);
  }

  if (loading && families.length === 0) {
    return (
      <SafeAreaView>
        <ActivityIndicator className="mt-8" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1" edges={["bottom", "left", "right"]}>
        <ErrorState message={error} onRetry={load} />
      </SafeAreaView>
    );
  }

  if (families.length === 0) {
    return (
      <SafeAreaView className="flex-1" edges={["bottom", "left", "right"]}>
        <Text>Nie należysz jeszcze do rodziny</Text>
        <View className="flex flex-row justify-between">
          <Pressable onPress={handleCreateFamily}>
            <Text>Utwórz rodzinę</Text>
          </Pressable>
          <Button
            title="Dołącz"
            onPress={() => navigation.navigate("AkceptacjaZaproszenia")}
            variant={"primary"}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 m-4" edges={["bottom", "left", "right"]}>
      <FlatList
        className="flex-1"
        data={families}
        keyExtractor={(f) => f.id}
        renderItem={({ item }) => (
          <View className="bg-surface border border-border rounded-2xl overflow-hidden">
            {item.members.map((member, index) => (
              <Pressable
                key={member.userId}
                onPress={() =>
                  navigation.navigate("ProfilCzlonkaRodziny", {
                    familyId: item.id,
                    userId: member.userId,
                  })
                }
                className={`flex-row justify-between items-center p-4 ${
                  index > 0 ? "border-t border-border" : ""
                }`}
              >
                <View>
                  <Text className="text-xl font-bold">
                    {member.firstName} {member.lastName}
                  </Text>

                  <View className="flex-row gap-2 mt-1">
                    {member.isOwner && (
                      <View className="px-2 py-0.5 rounded-md bg-tint-1">
                        <Text className="text-xs">Właściciel</Text>
                      </View>
                    )}

                    {member.isParent && (
                      <View className="px-2 py-0.5 rounded-md bg-tint-1">
                        <Text className="text-xs">Rodzic</Text>
                      </View>
                    )}

                    {member.isChild && (
                      <View className="px-2 py-0.5 rounded-md bg-tint-1">
                        <Text className="text-xs">Dziecko</Text>
                      </View>
                    )}

                    {!member.hasAccount && (
                      <View className="px-2 py-0.5 rounded-md bg-tint-1">
                        <Text className="text-xs">Bez konta</Text>
                      </View>
                    )}
                  </View>
                </View>

                <ChevronRight size={18} color={chevronColor} />
              </Pressable>
            ))}
          </View>
        )}
      />

      {families.map((item) => (
        <View key={item.id} className="gap-4 pt-4">
          {(item.isOwner || item.isParent) && (
            <>
              <Button
                title="Zaproś do rodziny"
                onPress={() =>
                  navigation.navigate("Zaproszenie", {
                    familyId: item.id,
                  })
                }
              />

              <Button
                title="Dodaj profil bez telefonu"
                onPress={() =>
                  navigation.navigate("DodajProfil", {
                    familyId: item.id,
                  })
                }
              />
            </>
          )}

          {!item.isOwner && (
            <Button
              title="Opuść rodzinę"
              onPress={() => confirmLeaveFamily(item.id)}
            />
          )}

          {item.isOwner && (
            <Button
              title="Usuń rodzinę"
              onPress={() => confirmDeleteFamily(item.id)}
              variant="danger"
            />
          )}
        </View>
      ))}
    </SafeAreaView>
  );
}
