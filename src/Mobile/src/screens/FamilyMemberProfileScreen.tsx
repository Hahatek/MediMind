import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { HomeStackList } from "../navigation/HomeStack";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { FamilyDetailsResponse, FamilyMembership } from "../types/FamilyTypes";
import {
  familyGet,
  familyGiveRoleParent,
  familyTransferOwnership,
} from "../api/family";
import { getErrorMessage } from "../utils/errorMessage";
import ErrorState from "../components/ErrorState";
import { Crown, KeyRound, Plus, UserCog, UserPlus } from "lucide-react-native";
import ActionList, { ActionItem } from "../components/ActionList";
import { GuardianResponse } from "../types/GuardianTypes";
import {
  guardianAdd,
  guardianGet,
  guardianMakePrimary,
  guardianRemove,
} from "../api/guardian";
import Button from "../components/Button";
import { DeviceResponse } from "../types/DeviceTypes";
import { deviceDelete, deviceGet } from "../api/device";
import { formatDate, formatDateLocal } from "../utils/dateFormat";

type Props = {
  navigation: NativeStackNavigationProp<HomeStackList, "ProfilCzlonkaRodziny">;
  route: RouteProp<HomeStackList, "ProfilCzlonkaRodziny">;
};

export default function FamilyMemberProfileScreen({
  navigation,
  route,
}: Props) {
  const [member, setMember] = useState<FamilyMembership | null>(null);
  const [currentFamily, setCurrentFamily] =
    useState<FamilyDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardians, setGuardians] = useState<GuardianResponse[]>([]);
  const [pickingGuardian, setPickingGuardian] = useState(false);
  const [devices, setDevices] = useState<DeviceResponse[]>([]);
  const actions: ActionItem[] = [];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const families = await familyGet();

      const family = families.find((item) => item.id === route.params.familyId);

      if (!family) {
        setError("Nie znaleziono rodziny");
        return;
      }

      const memberUserId = family.members.find(
        (item) => item.userId === route.params.userId,
      );

      if (!memberUserId) {
        setError("Nie znaleziono użytkownika w rodzinie");
        return;
      }

      if (memberUserId.isChild || !memberUserId.hasAccount) {
        const response = await guardianGet(memberUserId.userId);
        setGuardians(response);
      } else {
        setGuardians([]);
      }

      if (memberUserId.isPrimaryGuardianForMe) {
        const response = await deviceGet(route.params.userId);
        setDevices(response);
      } else {
        setDevices([]);
      }

      setMember(memberUserId);
      setCurrentFamily(family);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się pobrać rodzin"));
    } finally {
      setLoading(false);
    }
  }, [route.params.familyId, route.params.userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleGiveRoleParent(familyId: string, userId: string) {
    setLoading(true);
    try {
      await familyGiveRoleParent(familyId, userId);
      await load();
    } catch (e) {
      Alert.alert(
        "Błąd",
        getErrorMessage(e, "Nie udało się nadać roli rodzic"),
      );
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
      if (alsoLeaveFamily) {
        navigation.goBack();
      } else {
        await load();
      }
    } catch (e) {
      Alert.alert(
        "Błąd",
        getErrorMessage(e, "Nie udało się przekazać roli właściciela"),
      );
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

  async function handleRemoveGuardian(guardianUserId: string) {
    setLoading(true);
    try {
      await guardianRemove(route.params.userId, guardianUserId);
      await load();
    } catch (e) {
      Alert.alert(
        "Błąd",
        getErrorMessage(e, "Nie udało się usunąć roli opiekuna"),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleMakePrimaryGuardian(guardianUserId: string) {
    setLoading(true);
    try {
      await guardianMakePrimary(route.params.userId, guardianUserId);
      await load();
    } catch (e) {
      Alert.alert(
        "Błąd",
        getErrorMessage(e, "Nie udało się przekazać roli opiekuna"),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAddGuardian(guardianUserId: string) {
    setLoading(true);
    try {
      await guardianAdd(route.params.userId, { guardianUserId });
      setPickingGuardian(false);
      await load();
    } catch (e) {
      Alert.alert("Błąd", getErrorMessage(e, "Nie udało się dodać opiekuna"));
    } finally {
      setLoading(false);
    }
  }

  function chooseGuardianAction(guardian: GuardianResponse) {
    Alert.alert(
      `${guardian.firstName} ${guardian.lastName}`,
      `Co chcesz zrobić? ` +
        "Ustawienie tej osoby jako głównego opiekuna odbierze Ci tę rolę " +
        "Nie będziesz już mógł dodawać ani usuwać opiekunów.",
      [
        {
          text: "Ustaw jako głównego",
          onPress: () => handleMakePrimaryGuardian(guardian.userId),
        },
        {
          text: "Usuń opiekuna",
          style: "destructive",
          onPress: () => handleRemoveGuardian(guardian.userId),
        },
        { text: "Anuluj", style: "cancel" },
      ],
    );
  }

  async function handleDeleteDevice(deviceId: string) {
    setLoading(true);
    try {
      await deviceDelete(route.params.userId, deviceId);
      await load();
    } catch (e) {
      Alert.alert(
        "Błąd",
        getErrorMessage(e, "Nie udało się usunąć urządzenia"),
      );
    } finally {
      setLoading(false);
    }
  }

  function confirmDeleteDevice(deviceId: string) {
    Alert.alert(
      "Odłączyć urządzenie",
      `Czy na pewno chcesz usunąć urządzenie?`,
      [
        {
          text: "Usuń urządzenie",
          style: "destructive",
          onPress: () => handleDeleteDevice(deviceId),
        },
        { text: "Anuluj", style: "cancel" },
      ],
    );
  }

  if (loading) {
    return (
      <SafeAreaView>
        <ActivityIndicator className="mt-8" />
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

  if (!member || !currentFamily) {
    return null;
  }

  const candidatesToGuardian = currentFamily.members.filter(
    (m) =>
      m.hasAccount &&
      !m.isChild &&
      m.userId !== member.userId &&
      !guardians.some((g) => g.userId === m.userId),
  );

  const addGuardianAction: ActionItem[] = [
    {
      key: "addGuardian",
      label: "Dodaj opiekuna",
      icon: UserPlus,
      onPress: () => setPickingGuardian(true),
    },
  ];

  const candidateActions: ActionItem[] = candidatesToGuardian.map((c) => ({
    key: c.userId,
    label: `${c.firstName} ${c.lastName}`,
    icon: UserPlus,
    onPress: () => handleAddGuardian(c.userId),
  }));

  if (!member.hasAccount && member.isPrimaryGuardianForMe) {
    actions.push({
      key: "accessCode",
      label: "Przekaż kod",
      icon: KeyRound,
      onPress: () =>
        navigation.navigate("KodDostepu", {
          userId: member.userId,
          isChild: member.isChild,
          firstName: member.firstName,
          lastName: member.lastName,
        }),
    });
  }

  if (currentFamily.isOwner && !member.isParent && !member.isChild) {
    actions.push({
      key: "giveParent",
      label: "Nadaj rolę rodzica",
      icon: UserCog,
      onPress: () =>
        confirmGiveRoleParent(
          currentFamily.id,
          member.userId,
          member.firstName,
          member.lastName,
        ),
    });
  }

  if (currentFamily.isOwner && member.isParent && !member.isOwner) {
    actions.push({
      key: "transferOwner",
      label: "Przekaż rolę właściciela",
      icon: Crown,
      onPress: () =>
        confirmTransferOwnership(
          currentFamily.id,
          member.userId,
          member.firstName,
          member.lastName,
        ),
    });
  }

  return (
    <SafeAreaView className="flex-1 m-4" edges={["bottom", "left", "right"]}>
      <View>
        <Text className="font-bold text-2xl text-foreground">
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
            <View className="px-2 py-0.5 rounded-md bg-tint-1 ">
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
      <View className="flex  flex-row gap-4 mt-4">
        <Pressable
          className="bg-surface border border-border rounded-xl flex-1 p-4"
          onPress={() =>
            navigation.navigate("BadaniaCzlonka", {
              userId: member.userId,
              firstName: member.firstName,
              canManage: member.canManage,
            })
          }
        >
          <Text className="font-bold">Zobacz badania</Text>
        </Pressable>
        <Pressable
          className="bg-surface border border-border rounded-xl flex-1 p-4"
          onPress={() =>
            navigation.navigate("LekiCzlonka", {
              userId: member.userId,
              firstName: member.firstName,
              canManage: member.canManage,
            })
          }
        >
          <Text className="font-bold">Zobacz leki</Text>
        </Pressable>
      </View>
      <View className="mt-4">
        <ActionList actions={actions} />
      </View>
      {/* Lista opiekunów */}
      {guardians.length > 0 && (
        <View className="mt-4">
          <View>
            <Text className="font-semibold text-muted mb-2">Opiekunowie</Text>
          </View>
          <View className="bg-surface border border-border rounded-2xl overflow-hidden">
            {guardians.map((guardian, index) => (
              <Pressable
                key={guardian.userId}
                disabled={!member.isPrimaryGuardianForMe || guardian.isPrimary}
                onPress={() => chooseGuardianAction(guardian)}
                className={`p-4 flex flex-row items-center justify-between ${index > 0 ? "border-t border-border" : ""}`}
              >
                <Text className="text-foreground">
                  {guardian.firstName} {guardian.lastName}
                </Text>
                {guardian.isPrimary && (
                  <View className="px-2 py-0.5 rounded-md bg-tint-1">
                    <Text className="text-xs">Główny</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      )}
      {member.isPrimaryGuardianForMe && candidatesToGuardian.length > 0 && (
        <View className="mt-4">
          {pickingGuardian ? (
            <>
              <ActionList actions={candidateActions} />
              <View className="mt-2">
                <Button
                  title="Anuluj"
                  onPress={() => setPickingGuardian(false)}
                />
              </View>
            </>
          ) : (
            <ActionList actions={addGuardianAction} />
          )}
        </View>
      )}
      {/* Lista urządzeń */}
      {member.isPrimaryGuardianForMe && (
        <View className="mt-4">
          <View>
            <Text className="font-semibold text-muted mb-2">Urządzenia</Text>
          </View>
          <View className="bg-surface border border-border rounded-2xl overflow-hidden">
            {devices.length === 0 ? (
              <View className="p-4">
                <Text>Brak podłączonych urządzeń</Text>
              </View>
            ) : (
              devices.map((device, index) => (
                <View
                  key={device.id}
                  className={`p-4 flex flex-row items-center justify-between ${index > 0 ? "border-t border-border" : ""}`}
                >
                  <Text>
                    Telefon połączony od{" "}
                    {formatDate(formatDateLocal(new Date(device.createdAt)))}
                  </Text>
                  <Pressable onPress={() => confirmDeleteDevice(device.id)}>
                    <Text className="text-destructive">Odłącz</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
