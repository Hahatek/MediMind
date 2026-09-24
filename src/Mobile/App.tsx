import { useEffect, useState } from "react";
import "./global.css";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./src/navigation/AuthStack";
import AppStack from "./src/navigation/AppStack";
import { Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { refreshTokens, setSessionExpiredHandler } from "./src/api/client";
import { useNavigationTheme } from "./src/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";

type SessionStatus = "loading" | "loggedIn" | "loggedOut";

export default function App() {
  const navigationTheme = useNavigationTheme();
  const [status, setStatus] = useState<SessionStatus>("loading");

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

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="auto" />
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
          <Text className="text-foreground">SIABADABABA</Text>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
