import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import AccessCodeLoginScreen from "../screens/AccessCodeLoginScreen";
import AccessCodeChoiceScreen from "../screens/AccessCodeChoiceScreen";

type Props = {
  onLoginSuccess: () => void;
  onRegisterSuccess: () => void;
};

export type AuthStackList = {
  Login: undefined;
  Register: undefined;
  WyborKodu: undefined;
  MamKod: { mode: "link" | "claim" };
};

const Stack = createNativeStackNavigator<AuthStackList>();

function AuthStack({ onLoginSuccess, onRegisterSuccess }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {({ navigation }) => (
          <LoginScreen
            onLoginSuccess={onLoginSuccess}
            navigation={navigation}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {({ navigation }) => (
          <RegisterScreen
            onRegisterSuccess={onRegisterSuccess}
            navigation={navigation}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="WyborKodu"
        options={{ title: "Do czego jest kod?", headerShown: true }}
      >
        {({ navigation }) => <AccessCodeChoiceScreen navigation={navigation} />}
      </Stack.Screen>
      <Stack.Screen
        name="MamKod"
        options={({ route }) => ({
          title:
            route.params.mode === "link" ? "Kod logowania" : "Kod przekazania",
          headerShown: true,
        })}
      >
        {({ navigation, route }) => (
          <AccessCodeLoginScreen
            onLoginSuccess={onLoginSuccess}
            navigation={navigation}
            route={route}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default AuthStack;
