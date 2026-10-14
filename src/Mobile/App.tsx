import { useEffect, useState } from "react";
import "./global.css";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./src/navigation/AuthStack";
import AppStack from "./src/navigation/AppStack";
import { Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { refreshTokens, setSessionExpiredHandler } from "./src/api/client";
import { fontAssets, typography, useNavigationTheme } from "./src/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

type SessionStatus = "loading" | "loggedIn" | "loggedOut";

export default function App() {
  const navigationTheme = useNavigationTheme();
  const [status, setStatus] = useState<SessionStatus>("loading");
  // Bez załadowanych plików Manrope RN po cichu używa fontu systemowego.
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

    restoreSession();
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => setStatus("loggedOut"));

    return () => {
      setSessionExpiredHandler(null);
    };
  }, []);

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
