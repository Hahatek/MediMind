import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import AccessCodeLoginScreen from "../screens/AccessCodeLoginScreen";

type Props = {
  onLoginSuccess: () => void;
  onRegisterSuccess: () => void;
};

export type AuthStackList = {
  Login: undefined;
  Register: undefined;
  MamKod: undefined;
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
        name="MamKod"
        options={{ title: "Wpisz kod", headerShown: true }}
      >
        {({ navigation }) => (
          <AccessCodeLoginScreen
            onLoginSuccess={onLoginSuccess}
            navigation={navigation}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default AuthStack;
