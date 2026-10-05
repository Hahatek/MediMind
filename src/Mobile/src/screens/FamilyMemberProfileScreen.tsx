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
import { Crown, KeyRound, Plus, UserCog } from "lucide-react-native";
import ActionList, { ActionItem } from "../components/ActionList";

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

      setMember(memberUserId);
      setCurrentFamily(family);
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
            <View className="px-2 py-0.5 rounded-md bg-emerald-600 ">
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
        <Pressable className="bg-surface border border-border rounded-xl flex-1 p-4">
          <Text className="font-bold">Zobacz badania</Text>
        </Pressable>
        <Pressable className="bg-surface border border-border rounded-xl flex-1 p-4">
          <Text className="font-bold">Zobacz leki</Text>
        </Pressable>
      </View>
      <ActionList actions={actions} />
    </SafeAreaView>
  );
}
