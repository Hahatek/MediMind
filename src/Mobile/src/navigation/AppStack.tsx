import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ExaminationsStack, { ExaminationStack } from "./ExaminationsStack";
import { ClipboardPlus, Home, Pill, User } from "lucide-react-native";
import UserScreen from "../screens/UserScreen";
import MedicationsStack from "./MedicationsStack";
import HomeStack from "./HomeStack";
import { useColorScheme } from "nativewind";
import { useThemeColor } from "../theme";
import { NavigatorScreenParams } from "@react-navigation/native";

type Props = {
  onLogout: () => void;
};

export type AppStackList = {
  Home: undefined;
  Badania: NavigatorScreenParams<ExaminationStack> | undefined;
  Profil: undefined;
  Leki: undefined;
};

const Tab = createBottomTabNavigator<AppStackList>();

function AppStack({ onLogout }: Props) {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === "dark";
  const brandInk = useThemeColor("--brand-ink");

  const inkMuted = useThemeColor("--ink-5");

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: dark ? brandInk : "#178E9D",
        tabBarInactiveTintColor: dark ? inkMuted : "#999999",
        popToTopOnBlur: true,
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      >
        {() => <HomeStack onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen
        name="Badania"
        options={{
          tabBarIcon: ({ color, size }) => (
            <ClipboardPlus color={color} size={size} />
          ),
        }}
      >
        {() => <ExaminationsStack />}
      </Tab.Screen>
      <Tab.Screen
        name="Leki"
        options={{
          tabBarIcon: ({ color, size }) => <Pill color={color} size={size} />,
        }}
      >
        {() => <MedicationsStack />}
      </Tab.Screen>
      <Tab.Screen
        name="Profil"
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      >
        {() => <UserScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default AppStack;
