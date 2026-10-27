import { useEffect, useState } from "react";
import "./global.css";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./src/navigation/AuthStack";
import AppStack from "./src/navigation/AppStack";
import { Text, View, AppState } from "react-native";
import { StatusBar } from "expo-status-bar";
import { refreshTokens, setSessionExpiredHandler } from "./src/api/client";
import { fontAssets, typography, useNavigationTheme } from "./src/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import {
  setupNotificationChannels,
  ensureNotificationPermission,
  setupNotificationCategoris,
} from "./src/notifications/setup";
import * as Notification from "expo-notifications";
import { syncReminders } from "./src/notifications/sync";
import { handleNotificationResponse } from "./src/notifications/actions";
type SessionStatus = "loading" | "loggedIn" | "loggedOut";

export default function App() {
  const navigationTheme = useNavigationTheme();
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    async function restoreSession() {
      try {
        await refreshTokens();
        setStatus("loggedIn");
      } catch {
        setStatus("loggedOut");
      }
    }
    setupNotificationChannels();
    setupNotificationCategoris();
    restoreSession();
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => setStatus("loggedOut"));

    return () => {
      setSessionExpiredHandler(null);
    };
  }, []);

  useEffect(() => {
    if (status === "loggedOut") {
      Notification.cancelAllScheduledNotificationsAsync();
      return;
    }
    if (status !== "loggedIn") return;

    async function prepareNotifications() {
      await ensureNotificationPermission();
      await syncReminders();
    }
    prepareNotifications().catch((e) =>
      console.warn("Synchronizacja przypomnień nie powiodła się", e),
    );

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        syncReminders().catch((e) =>
          console.warn("Synchronizacja przypomnień nie powiodła się", e),
        );
      }
    });

    async function onResponse(response: Notification.NotificationResponse) {
      try {
        await handleNotificationResponse(response);
      } catch (e) {
        console.warn("Nie udało się zapisać dawki", e);
      } finally {
        Notification.clearLastNotificationResponse();
      }
    }

    const last = Notification.getLastNotificationResponse();

    if (last) {
      onResponse(last);
    }

    const responseSubscription =
      Notification.addNotificationResponseReceivedListener(onResponse);

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, [status]);

  // Czekamy na fonty (przy błędzie ładowania i tak pokazujemy aplikację).
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="light" />
        {status === "loggedOut" && (
          <AuthStack
            onLoginSuccess={() => setStatus("loggedIn")}
            onRegisterSuccess={() => setStatus("loggedIn")}
          />
        )}
        {status === "loggedIn" && (
          <AppStack onLogout={() => setStatus("loggedOut")} />
        )}
        {status === "loading" && (
          <Text className="text-foreground" style={typography.body}>
            SIABADABABA
          </Text>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
