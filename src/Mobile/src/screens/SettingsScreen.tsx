import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Constants from "expo-constants";
import {
  LogOut,
  LucideIcon,
  Mail,
  Moon,
  Palette,
  Smartphone,
  Sun,
  Tag,
} from "lucide-react-native";
import { getMe } from "../api/user";
import { endSession } from "../api/auth";
import Button from "../components/Button";
import SettingsGroup, { GroupLabel, RowIcon } from "../components/SettingsGroup";
import {
  fonts,
  setThemeMode,
  typography,
  useThemeColor,
  useThemeMode,
  type ThemeMode,
} from "../theme";
import { UserResponse } from "../types/UserTypes";

type Props = {
  onLogout: () => void;
};

const themes: { mode: ThemeMode; label: string; icon: LucideIcon; hint: string }[] = [
  {
    mode: "system",
    label: "Systemowy",
    icon: Smartphone,
    hint: "Wygląd zmienia się razem z ustawieniem telefonu.",
  },
  { mode: "light", label: "Jasny", icon: Sun, hint: "Jasne tło przez cały dzień." },
  {
    mode: "dark",
    label: "Ciemny",
    icon: Moon,
    hint: "Ciemne tło — mniej razi wieczorem.",
  },
];

export default function SettingsScreen({ onLogout }: Props) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const mode = useThemeMode();
  const activeColor = useThemeColor("--brand-ink");
  const inactiveColor = useThemeColor("--ink-5");
  const version = Constants.expoConfig?.version ?? "";
  const current = themes.find((t) => t.mode === mode) ?? themes[0];

  useFocusEffect(
    useCallback(() => {
      async function load() {
        try {
          const me = await getMe();
          setUser(me);
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
    <ScrollView
      className="flex-1 bg-grouped"
      contentContainerClassName="pt-3.5 px-5 pb-9 gap-7"
    >
      <SettingsGroup
        label="Konto"
        rows={[
          {
            icon: Mail,
            label: "E-mail",
            sub: user?.email ?? undefined,
            nav: false,
          },
        ]}
      />

      <View className="gap-2.5">
        <GroupLabel>Wygląd</GroupLabel>
        <View className="bg-surface rounded-[14px] border border-line-2 p-[18px] gap-3.5">
          <View className="flex-row items-center gap-3.5">
            <RowIcon icon={Palette} />
            <Text className="text-ink-2" style={typography["option.label"]}>
              Motyw
            </Text>
          </View>
          <View
            accessibilityRole="radiogroup"
            className="h-[68px] rounded-xl bg-bg-1 p-1 flex-row gap-1"
          >
            {themes.map((theme) => {
              const selected = theme.mode === mode;
              const Icon = theme.icon;
              return (
                <Pressable
                  key={theme.mode}
                  onPress={() => setThemeMode(theme.mode)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  className={`flex-1 rounded-[9px] items-center justify-center gap-1.5 ${selected ? "bg-surface border border-line-2" : ""}`}
                  style={
                    selected
                      ? { boxShadow: "0 1px 2px rgba(0,31,38,0.14)" }
                      : undefined
                  }
                >
                  <Icon size={20} color={selected ? activeColor : inactiveColor} />
                  <Text
                    className={selected ? "text-brand-ink" : "text-ink-5"}
                    style={{
                      fontFamily: selected ? fonts.semibold : fonts.medium,
                      fontSize: 14,
                      lineHeight: 18,
                    }}
                  >
                    {theme.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text className="text-ink-5" style={typography["caption.xs"]}>
            {current.hint}
          </Text>
        </View>
      </View>

      <SettingsGroup
        label="Aplikacja"
        rows={[{ icon: Tag, label: "Wersja", value: version, nav: false }]}
      />

      <View className="pt-1.5">
        <Button
          title="Wyloguj się"
          variant="neutral"
          iconLeft={LogOut}
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
}
