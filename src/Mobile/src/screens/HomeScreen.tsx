import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { getMe } from "../api/user";
import { endSession } from "../api/auth";
import Button from "../components/Button";
import { HomeStackList } from "../navigation/HomeStack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar,
  ChevronRight,
  Clock,
  UserRoundGroup,
} from "lucide-react-native";
import {
  CompositeNavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import type { AppStackList } from "../navigation/AppStack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { examinationGet } from "../api/examination";
import { getErrorMessage } from "../utils/errorMessage";
import { ExaminationResponse } from "../types/ExaminationTypes";
import ExaminationCard from "../components/ExaminationCard";
import {
  getExaminationDisplayStatus,
  getUpcomingExaminations,
} from "../utils/examinationDisplayStatus";
import { getExamStatusStyle, useThemeColor } from "../theme";

type Props = {
  navigation: CompositeNavigationProp<
    NativeStackNavigationProp<HomeStackList, "StronaGlowna">,
    BottomTabNavigationProp<AppStackList>
  >;
};

export default function HomeScreen({ navigation }: Props) {
  const [nameUser, setNameUser] = useState("");
  const [examinationsRespons, setExaminationsRespons] = useState<
    ExaminationResponse[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const day = new Date();
  const upcoming = getUpcomingExaminations(examinationsRespons, day);

  const nextExam = upcoming[0];
  const nextStyle = nextExam
    ? getExamStatusStyle(getExaminationDisplayStatus(nextExam, day))
    : null;

  const chevronColor = useThemeColor("--ink-4");

  useEffect(() => {
    async function load() {
      const userData = await getMe();
      setNameUser(userData.firstName);
    }
    load();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const examinationData = await examinationGet();
      setExaminationsRespons(examinationData);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e, "Nie udało się pobrać badań"));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function openDetailsExamination(examinationId: string) {
    navigation.navigate("Badania", {
      screen: "SzczegolyBadania",
      params: { examinationId, canManage: true },
      initial: false,
    });
  }

  return (
    <SafeAreaView
      className="flex-1 bg-screen m-4"
      edges={["bottom", "left", "right"]}
    >
      <ScrollView>
        <View className="mt-8">
          <View className="mt-6">
            <Text className="text-muted-foreground text-base">
              Dzień dobry,
            </Text>
            <Text className="text-foreground text-3xl font-bold">
              {nameUser}
            </Text>
          </View>
        </View>

        {nextExam && (
          <Pressable
            className="bg-primary rounded-2xl p-5 mt-8"
            onPress={() => openDetailsExamination(nextExam.id)}
          >
            <View className="flex flex-row justify-between">
              <Text className="text-white">Najbliższe badanie</Text>
              {nextStyle && (
                <View className={`px-3 py-1 }`}>
                  <Text className="text-white">{nextStyle.label}</Text>
                </View>
              )}
            </View>
            <Text className="text-white text-[32px] font-bold">
              {nextExam.name}
            </Text>
            <View className="flex flex-row gap-4 mt-4">
              <View className="flex flex-row gap-2">
                <Calendar color={"#ffffff"} />
                <Text className="text-white">{nextExam.date}</Text>
              </View>
              <View className="flex flex-row gap-2">
                <Clock color={"#ffffff"} />
                <Text className="text-white">{nextExam.time}</Text>
              </View>
            </View>
          </Pressable>
        )}

        <Pressable
          className="bg-surface w-full border border-border rounded-xl mt-8"
          onPress={() => navigation.navigate("Rodzina")}
        >
          <View className="flex flex-row justify-between items-center p-4">
            <View className="flex flex-row items-center">
              <UserRoundGroup color="#087B8C" size={22} />
              <Text className="pl-4 text-foreground">Moja rodzina</Text>
            </View>
            <ChevronRight color={chevronColor} />
          </View>
        </Pressable>

        <View className="mt-8">
          <View className="flex flex-row justify-between mb-4">
            <Text className="text-foreground">Badania nadchodzące</Text>
            <Pressable onPress={() => navigation.navigate("Badania")}>
              <Text className="text-primary">Wszystkie</Text>
            </Pressable>
          </View>
          {loading && examinationsRespons.length === 0 ? (
            <ActivityIndicator className="mt-8" />
          ) : upcoming.length === 0 ? (
            <Text className="text-muted-foreground">
              Brak nadchodzących badań
            </Text>
          ) : (
            upcoming.slice(0, 3).map((item) => (
              <Pressable
                key={item.id}
                onPress={() => openDetailsExamination(item.id)}
              >
                <ExaminationCard
                  name={item.name}
                  date={item.date}
                  color={item.color}
                  status={getExaminationDisplayStatus(item, day)}
                  time={item.time}
                />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
