import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { HomeStackList } from "../../navigation/HomeStack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, ActivityIndicator } from "react-native";
import { accessCodeCreate } from "../../api/user";
import { getErrorMessage } from "../../utils/errorMessage";
import { CodeActionType } from "../../types/EnumTypes";
import { AccessCodeResponse, CreateAccessCode } from "../../types/UserTypes";
import Button from "../../components/Button";
import ErrorState from "../../components/ErrorState";

type Props = {
  navigation: NativeStackNavigationProp<HomeStackList, "KodDostepu">;
  route: RouteProp<HomeStackList, "KodDostepu">;
};

export default function FamilyAccessCodeScreen({ navigation, route }: Props) {
  const [accessCode, setAccessCode] = useState<AccessCodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccessCode(actionTypeParm: CodeActionType) {
    const code: CreateAccessCode = {
      actionType: actionTypeParm,
    };
    setLoading(true);
    setError(null);
    try {
      const response = await accessCodeCreate(route.params.userId, code);
      setAccessCode(response);
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się wygenerować kodu"));
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
  if (accessCode !== null) {
    return (
      <SafeAreaView className="m-4" edges={["bottom", "left", "right"]}>
        <Text className="dark:text-foreground">{accessCode.code}</Text>
        <Text className="dark:text-foreground">Ważny do: {new Date(accessCode.expiresAt).toLocaleString()}</Text>
        <Text className="dark:text-foreground">
          {accessCode.actionType === "LinkDevice"
            ? "Wpisz ten kod na telefonie tej osoby: ekran logowanie i przycisk Wpisz kod"
            : "Przekaż ten kod tej osobie, która ma założyć konto"}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="m-4" edges={["bottom", "left", "right"]}>
      <Text className="dark:text-foreground">
        Kod dla: {route.params.firstName} {route.params.lastName}
      </Text>
      <View className="gap-3 mt-4">
        <Button
          title="Kod do telefonu"
          variant="primary"
          onPress={() => handleAccessCode("LinkDevice")}
        />
        {!route.params.isChild && (
          <Button
            title="Kod do założenia konta"
            variant="secondary"
            onPress={() => handleAccessCode("ClaimProfile")}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
