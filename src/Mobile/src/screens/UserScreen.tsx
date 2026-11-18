import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  CompositeNavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings, Users } from "lucide-react-native";
import { getMe } from "../api/user";
import { endSession } from "../api/auth";
import { familyGet } from "../api/family";
import SettingsGroup, { Chevron, GroupLabel } from "../components/SettingsGroup";
import { fonts, typography, useThemeColor } from "../theme";
import { UserResponse } from "../types/UserTypes";
import { FamilyMembership } from "../types/FamilyTypes";
import { ProfileStackList } from "../navigation/ProfileStack";
import { AppStackList } from "../navigation/AppStack";

type Props = {
  navigation: CompositeNavigationProp<
    NativeStackNavigationProp<ProfileStackList, "ProfilGlowny">,
    BottomTabNavigationProp<AppStackList>
  >;
  onLogout: () => void;
};

const avatarColors = [
  ["bg-tint-1", "text-brand-ink"],
  ["bg-status-scheduled", "text-status-scheduled-foreground"],
  ["bg-warn-bg", "text-warn-ink"],
];

function initialsOf(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function UserScreen({ navigation, onLogout }: Props) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [members, setMembers] = useState<FamilyMembership[]>([]);
  const onBrandColor = useThemeColor("--on-brand");
  const version = Constants.expoConfig?.version ?? "";

  useFocusEffect(
    useCallback(() => {
      async function load() {
        try {
          const [me, families] = await Promise.all([getMe(), familyGet()]);
          const others = new Map<string, FamilyMembership>();
          families
            .flatMap((f) => f.members)
            .filter((m) => !m.isMe)
            .forEach((m) => others.set(m.userId, m));
          setUser(me);
          setMembers([...others.values()]);
        } catch {}
      }
      load();
    }, []),
  );

  async function handleLogout() {
    await endSession();
    onLogout();
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-grouped">
      <ScrollView contentContainerClassName="pt-4 px-5 pb-8 gap-7">
        <Text className="text-ink-1 px-1 pt-1" style={typography["title.page"]}>
          Profil
        </Text>

        <View className="bg-surface rounded-[14px] border border-line-2 min-h-[88px] flex-row items-center gap-4 px-[18px] py-3.5">
          <View className="w-12 h-12 rounded-full bg-brand items-center justify-center">
            <Text
              className="text-on-brand"
              style={{ fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 }}
            >
              {user ? initialsOf(user.firstName, user.lastName) : ""}
            </Text>
          </View>
          <View className="flex-1 gap-[3px]">
            <Text className="text-ink-1" style={typography["row.label"]}>
              {user ? `${user.firstName} ${user.lastName}` : ""}
            </Text>
            {user?.email && (
              <Text className="text-ink-5" style={typography["caption.xs"]}>
                {user.email}
              </Text>
            )}
          </View>
        </View>

        <View className="gap-2.5">
          <GroupLabel>Rodzina</GroupLabel>
          <Pressable
            onPress={() =>
              navigation.navigate("Home", { screen: "Rodzina", initial: false })
            }
            accessibilityRole="button"
            className="bg-surface rounded-[14px] border border-line-2 min-h-[72px] flex-row items-center gap-4 px-[18px] py-3"
          >
            <View className="w-8 h-8 rounded-lg bg-brand items-center justify-center">
              <Users size={18} color={onBrandColor} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-ink-2" style={typography["option.label"]}>
                Moja rodzina
              </Text>
              <Text
                className="text-ink-5"
                style={typography["caption.xs"]}
                numberOfLines={1}
              >
                {members.length > 0
                  ? members.map((m) => m.firstName).join(", ")
                  : "Dodaj bliskich"}
              </Text>
            </View>
            {members.length > 0 && (
              <View className="flex-row pl-2">
                {members.slice(0, 3).map((m, index) => (
                  <View
                    key={m.userId}
                    className={`w-7 h-7 rounded-full border-2 border-surface -ml-2 items-center justify-center ${avatarColors[index][0]}`}
                  >
                    <Text
                      className={avatarColors[index][1]}
                      style={{ fontFamily: fonts.semibold, fontSize: 10, lineHeight: 12 }}
                    >
                      {initialsOf(m.firstName, m.lastName)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <Chevron />
          </Pressable>
        </View>

        <SettingsGroup
          label="Aplikacja"
          rows={[
            {
              icon: Settings,
              label: "Ustawienia",
              onPress: () => navigation.navigate("Ustawienia"),
            },
          ]}
        />

        <Pressable
          onPress={handleLogout}
          accessibilityRole="button"
          className="bg-surface rounded-[14px] border border-line-2 h-14 items-center justify-center"
        >
          <Text
            className="text-danger"
            style={{ fontFamily: fonts.medium, fontSize: 17, lineHeight: 22 }}
          >
            Wyloguj się
          </Text>
        </Pressable>

        <Text
          className="text-ink-6 text-center"
          style={{ fontFamily: fonts.regular, fontSize: 13, lineHeight: 16 }}
        >
          MediMind {version}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
