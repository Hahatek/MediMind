import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackList } from "../../navigation/HomeStack";
import { RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Share, Text, View } from "react-native";
import { useEffect, useState } from "react";
import {
  CircleX,
  Clock,
  RefreshCw,
  Share2,
  ShieldCheck,
} from "lucide-react-native";
import { FamilyInviteResponse } from "../../types/FamilyTypes";
import { inviteCancel, inviteCreate } from "../../api/family";
import { getErrorMessage } from "../../utils/errorMessage";
import ErrorState from "../../components/ErrorState";
import Button from "../../components/Button";
import { fonts, typography } from "../../theme/typography";
import { useThemeColor } from "../../theme/useThemeColor";

type Props = {
  navigation: NativeStackNavigationProp<HomeStackList, "Zaproszenie">;
  route: RouteProp<HomeStackList, "Zaproszenie">;
};

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatExpired(date: Date) {
  const time = date.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return `dziś o ${time}`;
  if (date.toDateString() === yesterday.toDateString())
    return `wczoraj o ${time}`;
  return `${date.toLocaleDateString("pl-PL")} o ${time}`;
}

export default function FamilyInviteScreen({ navigation, route }: Props) {
  const [invite, setInvite] = useState<FamilyInviteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const iconColor = useThemeColor("--ink-3");
  const warnColor = useThemeColor("--warn-ink");

  useEffect(() => {
    handleGenerate();
  }, []);

  useEffect(() => {
    if (!invite) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [invite]);

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await inviteCreate(route.params.familyId);
      setInvite(result);
      setNow(Date.now());
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się wygenerować kodu"));
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
      setLoading(false);
    }
  }

  async function handleShare(code: string) {
    await Share.share({
      message: `Kod do rodziny w MediMind: ${code}. Wpisz go w „Dołącz”.`,
    });
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-screen">
        <ActivityIndicator className="mt-8" />
      </SafeAreaView>
    );
  }

  if (error || invite === null) {
    return (
      <SafeAreaView
        className="flex-1 bg-screen"
        edges={["bottom", "left", "right"]}
      >
        <ErrorState message={error ?? "Nie udało się wygenerować kodu"} />
      </SafeAreaView>
    );
  }

  const expiresAt = new Date(invite.expiresAt);
  const expired = expiresAt.getTime() <= now;

  return (
    <SafeAreaView
      className="flex-1 bg-screen px-5 pt-7 pb-8"
      edges={["bottom", "left", "right"]}
    >
      {!expired && (
        <Text className="text-ink-3 text-center mb-6" style={typography["body.sm"]}>
          Przekaż ten kod osobie, którą zapraszasz do rodziny. Wpisze go w
          „Dołącz”.
        </Text>
      )}

      <View className="bg-surface border border-line-1 rounded-3xl px-4 pt-7 pb-6 items-center gap-5">
        <View className="flex-row items-center gap-2">
          {invite.code.split("").map((digit, index) => (
            <View
              key={index}
              className={`w-11 h-[60px] rounded-xl items-center justify-center ${expired ? "bg-bg-2" : "bg-tint-1"} ${index === 3 ? "ml-2" : ""}`}
            >
              <Text
                className={expired ? "text-ink-5 line-through" : "text-brand"}
                maxFontSizeMultiplier={1}
                style={{
                  fontFamily: fonts.monoSemibold,
                  fontSize: 32,
                  lineHeight: 38,
                  includeFontPadding: false,
                  textAlignVertical: "center",
                }}
              >
                {digit}
              </Text>
            </View>
          ))}
        </View>

        {expired ? (
          <View className="h-9 flex-row items-center gap-2 rounded-full px-4 bg-warn-bg">
            <Clock size={18} color={warnColor} />
            <Text className="text-warning" style={typography.segment}>
              Kod wygasł {formatExpired(expiresAt)}
            </Text>
          </View>
        ) : (
          <View className="h-9 flex-row items-center gap-2 rounded-full px-4 bg-bg-2">
            <Clock size={18} color={iconColor} />
            <Text className="text-ink-3" style={typography.caption}>
              Wygasa za{" "}
              <Text
                className="text-foreground"
                style={{ fontFamily: fonts.monoSemibold }}
              >
                {formatCountdown(expiresAt.getTime() - now)}
              </Text>
            </Text>
          </View>
        )}
      </View>

      {expired ? (
        <Text className="text-ink-3 text-center mt-4" style={typography["body.sm"]}>
          Nikt z niego nie skorzystał. Wygeneruj nowy — stary przestaje działać.
        </Text>
      ) : (
        <>
          <View className="mt-4">
            <Button
              title="Udostępnij"
              variant="neutral"
              iconLeft={Share2}
              onPress={() => handleShare(invite.code)}
            />
          </View>
          <View className="flex-row items-start gap-3 rounded-2xl px-4 py-3 mt-4 bg-bg-2">
            <ShieldCheck size={18} color={iconColor} />
            <Text className="flex-1 text-ink-3" style={typography["caption.xs"]}>
              Kod działa raz. Po dołączeniu sam zdecydujesz, co ta osoba widzi.
            </Text>
          </View>
        </>
      )}

      <View className="flex-1" />

      {expired ? (
        <Button
          title="Wygeneruj nowy kod"
          iconLeft={RefreshCw}
          onPress={handleGenerate}
        />
      ) : (
        <Button
          title="Anuluj zaproszenie"
          variant="danger"
          iconLeft={CircleX}
          onPress={() => handleDelete(invite.id)}
        />
      )}
    </SafeAreaView>
  );
}
