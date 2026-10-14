import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthStackList } from "../navigation/AuthStack";
import { View, Text, Pressable } from "react-native";
import Button from "../components/Button";
import { typography } from "../theme";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackList, "WyborKodu">;
};

export default function AccessCodeChoiceScreen({ navigation }: Props) {
  const [mode, setMode] = useState<"link" | "claim">("link");

  return (
    <SafeAreaView
      className="flex flex-1 m-4"
      edges={["bottom", "left", "right"]}
    >
      <Text className="text-ink-3" style={typography.body}>
        Wybierz, co chcesz zrobić. Kod dostaniesz od rodzica albo opiekuna.
      </Text>
      <View className="gap-3 mt-6">
        <Pressable
          onPress={() => setMode("link")}
          className={`flex flex-row items-start gap-3 bg-surface rounded-2xl p-4 ${mode === "link" ? "border-2 border-primary" : "border border-border"}`}
        >
          <View className="flex flex-1 gap-1">
            <Text className="text-foreground" style={typography["option.label"]}>
              Zaloguj ten telefon
            </Text>
            <Text className="text-ink-3" style={typography["body.sm"]}>
              Masz już konto w rodzinie. Telefon zaloguje się na nie bez hasła.
            </Text>
          </View>
          <View
            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${mode === "link" ? "border-primary" : "border-border"}`}
          >
            {mode === "link" && (
              <View className="w-3 h-3 rounded-full bg-primary" />
            )}
          </View>
        </Pressable>
        <Pressable
          onPress={() => setMode("claim")}
          className={`flex flex-row items-start gap-3 bg-surface rounded-2xl p-4 ${mode === "claim" ? "border-2 border-primary" : "border border-border"}`}
        >
          <View className="flex flex-1 gap-1">
            <Text className="text-foreground" style={typography["option.label"]}>
              Przejmij swój profil
            </Text>
            <Text className="text-ink-3" style={typography["body.sm"]}>
              Rodzina założyła Ci profil. Po przejęciu będzie Twój i przejdzie
              na ten telefon.
            </Text>
          </View>
          <View
            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${mode === "claim" ? "border-primary" : "border-border"}`}
          >
            {mode === "claim" && (
              <View className="w-3 h-3 rounded-full bg-primary" />
            )}
          </View>
        </Pressable>
      </View>
      <View className="flex-1" />
      <Button
        title="Dalej"
        variant="primary"
        onPress={() => navigation.navigate("MamKod", { mode })}
      />
    </SafeAreaView>
  );
}
