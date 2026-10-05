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
  familyGiveRoleParent,
  familyLeave,
  familyTransferOwnership,
} from "../api/family";
import { getErrorMessage } from "../utils/errorMessage";
import { useFocusEffect } from "@react-navigation/native";
import ErrorState from "../components/ErrorState";
import Button from "../components/Button";

type Props = {
  navigation: NativeStackNavigationProp<HomeStackList, "Rodzina">;
};

export default function FamilyScreen({ navigation }: Props) {
  const [families, setFamilies] = useState<FamilyDetailsResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleGiveRoleParent(familyId: string, userId: string) {
    setLoading(true);
    try {
      await familyGiveRoleParent(familyId, userId);
      await load();
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się nadać roli rodzic"));
    } finally {
      setLoading(false);
    }
  }

  function confirmGiveRoleParent(
    familyId: string,
    userId: string,
    firstName: string,
    lastName: string,
  ) {
    Alert.alert(
      "Nadaj rolę rodzic",
      `Czy na pewno chcesz nadać ${firstName} ${lastName} rolę rodzica? ` +
        "Ta osoba będzie mogła zapraszać do rodziny i dodawać profile zarządzane. " +
        "Tej zmiany nie da się cofnąć w aplikacji.",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Nadaj",
          onPress: () => handleGiveRoleParent(familyId, userId),
        },
      ],
    );
  }

  async function handleTransferOwnership(
    familyId: string,
    userId: string,
    alsoLeaveFamily: boolean,
  ) {
    setLoading(true);
    try {
      await familyTransferOwnership(familyId, {
        newOwnerId: userId,
        alsoLeaveFamily,
      });
      await load();
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się przekazać roli właściciela"));
    } finally {
      setLoading(false);
    }
  }

  function confirmTransferOwnership(
    familyId: string,
    userId: string,
    firstName: string,
    lastName: string,
  ) {
    Alert.alert(
      "Przekaż rolę właściciela rodziny",
      `Czy na pewno chcesz przekazać ${firstName} ${lastName} rolę właściciela? ` +
        "Ta osoba stanie się właścicielem rodziny. ",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Przekaż",
          onPress: () => handleTransferOwnership(familyId, userId, false),
        },
        {
          text: "Przekaż i opuść",
          style: "destructive",
          onPress: () => handleTransferOwnership(familyId, userId, true),
        },
      ],
    );
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
    <SafeAreaView>
      <FlatList
        data={families}
        keyExtractor={(f) => f.id}
        renderItem={({ item }) => (
          <View>
            {item.members.map((member) => (
              <View key={member.userId}>
                <Text>
                  {member.firstName} {member.lastName}
                </Text>
                {member.isOwner && <Text>Właściciel</Text>}
                {member.isParent && <Text>Rodzic</Text>}
                {!member.hasAccount && <Text>Brak konta</Text>}
                {item.isOwner && !member.isParent && (
                  <View className="mt-5">
                    <Button
                      title="Nadaj rolę rodzica"
                      onPress={() =>
                        confirmGiveRoleParent(
                          item.id,
                          member.userId,
                          member.firstName,
                          member.lastName,
                        )
                      }
                    />
                  </View>
                )}
                {item.isOwner && member.isParent && !member.isOwner && (
                  <View className="mt-5">
                    <Button
                      title="Przekaż rolę właściciela"
                      onPress={() =>
                        confirmTransferOwnership(
                          item.id,
                          member.userId,
                          member.firstName,
                          member.lastName,
                        )
                      }
                    />
                  </View>
                )}
                {!member.hasAccount && member.isPrimaryGuardianForMe && (
                  <View className="mt-5">
                    <Button
                      title="Przekaż kod"
                      onPress={() =>
                        navigation.navigate("KodDostepu", {
                          userId: member.userId,
                          isChild: member.isChild,
                          firstName: member.firstName,
                          lastName: member.lastName,
                        })
                      }
                    />
                  </View>
                )}
              </View>
            ))}
            {(item.isOwner || item.isParent) && (
              <View className="mt-5 flex flex-col gap-4">
                <Button
                  title="Zaproś do rodziny"
                  onPress={() =>
                    navigation.navigate("Zaproszenie", { familyId: item.id })
                  }
                />
                <Button
                  title="Dodaj profil bez telefonu"
                  onPress={() =>
                    navigation.navigate("DodajProfil", { familyId: item.id })
                  }
                />
              </View>
            )}
            {!item.isOwner && (
              <View className="mt-5">
                <Button
                  title="Opuść rodzinę"
                  onPress={() => confirmLeaveFamily(item.id)}
                />
              </View>
            )}
            {item.isOwner && (
              <View className="mt-5">
                <Button
                  title="Usuń rodzinę"
                  onPress={() => confirmDeleteFamily(item.id)}
                />
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
