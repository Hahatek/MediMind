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
    const steps =
      accessCode.actionType === "LinkDevice"
        ? [
            "Otwórz MediMind na telefonie tej osoby",
            "Na ekranie logowania wybierz „Wpisz kod”, potem „Zaloguj ten telefon”",
            "Wpisz 6 cyfr i naciśnij „Zaloguj”",
          ]
        : [
            "Otwórz MediMind na telefonie tej osoby",
            "Na ekranie logowania wybierz „Wpisz kod”, potem „Przejmij swój profil”",
            "Wpisz 6 cyfr, ustaw własny e-mail i hasło",
          ];

    return (
      <SafeAreaView className="flex-1 m-4" edges={["bottom", "left", "right"]}>
        <View className="flex bg-surface border border-border rounded-2xl p-4 justify-center items-center gap-4">
          <View className="flex flex-row gap-2">
            {accessCode.code.split("").map((digit, index) => (
              <View
                key={index}
                className="flex flex-1 h-16 bg-tint-1 rounded-xl items-center justify-center"
              >
                <Text className="text-3xl font-semibold text-foreground">
                  {digit}
                </Text>
              </View>
            ))}
          </View>
          <Text className="text-foreground">
            Ważny do: {new Date(accessCode.expiresAt).toLocaleString()}
          </Text>
        </View>
        <Text className="text-foreground text-xl mt-4">
          Wpisz na wybranym urządzeniu
        </Text>
        <View className="gap-3 mt-3">
          {steps.map((step, index) => (
            <View key={index} className="flex-row items-center gap-3">
              <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                <Text className="text-primary-foreground font-semibold">
                  {index + 1}
                </Text>
              </View>
              <Text className="flex-1 text-foreground">{step}</Text>
            </View>
          ))}
        </View>
        <View className="flex-1" />
        <Button
          title="Gotowe"
          variant="primary"
          onPress={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="m-4" edges={["bottom", "left", "right"]}>
      <Text className="text-foreground">
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
