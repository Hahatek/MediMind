import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackList } from "../navigation/HomeStack";
import { RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { useState } from "react";
import { FamilyInviteResponse } from "../types/FamilyTypes";
import { inviteAccept, inviteCancel, inviteCreate } from "../api/family";
import { getErrorMessage } from "../utils/errorMessage";
import ErrorState from "../components/ErrorState";
import Button from "../components/Button";

type Props = {
  navigation: NativeStackNavigationProp<HomeStackList, "Zaproszenie">;
  route: RouteProp<HomeStackList, "Zaproszenie">;
};

export default function FamilyInviteScreen({ navigation, route }: Props) {
  const [invite, setInvite] = useState<FamilyInviteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await inviteCreate(route.params.familyId);
      setInvite(result);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się wygenerować"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(inviteId: string) {
    setLoading(true);
    try {
      await inviteCancel(route.params.familyId, inviteId);
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się anulować zaproszenia"));
    } finally {
      setLoading(false);
    }
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

  if (invite !== null) {
    return (
      <SafeAreaView>
        <Text>{invite.code}</Text>
        <Text>{new Date(invite.expiresAt).toLocaleString()}</Text>
        <Button
          onPress={() => handleDelete(invite.id)}
          title="Usuń kod"
          variant={"danger"}
        />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="m-4" edges={["bottom", "left", "right"]}>
      <Button onPress={handleGenerate} title="Generuj kod" />
    </SafeAreaView>
  );
}
