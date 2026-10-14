import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ExaminationsStack, { ExaminationStack } from "./ExaminationsStack";
import { ClipboardPlus, Home, Pill, User } from "lucide-react-native";
import UserScreen from "../screens/UserScreen";
import MedicationsStack from "./MedicationsStack";
import HomeStack from "./HomeStack";
import { useColorScheme } from "nativewind";
import {
  iconSizes,
  MAX_FONT_SCALE_CONTROLS,
  typography,
  useThemeColor,
} from "../theme";
import { NavigatorScreenParams } from "@react-navigation/native";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const TAB_BAR_EXTRA_BOTTOM = 8;
// Domyślne 49 + miejsce na ikonę 24 i etykietę 12/15 (także przy skali 1.3×).
const TAB_BAR_BASE_HEIGHT = 54;

function AppStack({ onLogout }: Props) {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === "dark";
  const brandInk = useThemeColor("--brand-ink");

  const inkMuted = useThemeColor("--ink-5");
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: dark ? brandInk : "#178E9D",
        tabBarInactiveTintColor: dark ? inkMuted : "#999999",
        popToTopOnBlur: true,
        // Dodatkowy odstęp pod ikonami/etykietami. Wysokość = domyślne 49 + safe area + extra,
        // inaczej większy paddingBottom ścisnąłby zawartość paska.
        tabBarStyle: {
          height: TAB_BAR_BASE_HEIGHT + insets.bottom + TAB_BAR_EXTRA_BOTTOM,
          paddingBottom: insets.bottom + TAB_BAR_EXTRA_BOTTOM,
        },
        tabBarLabel: ({ focused, color, children }) => (
          <Text
            maxFontSizeMultiplier={MAX_FONT_SCALE_CONTROLS}
            style={[
              typography[focused ? "nav.label.active" : "nav.label"],
              { color },
            ]}
          >
            {children}
          </Text>
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color }) => (
            <Home color={color} size={iconSizes.bottomNav} />
          ),
        }}
      >
        {() => <HomeStack onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen
        name="Badania"
        options={{
          tabBarIcon: ({ color }) => (
            <ClipboardPlus color={color} size={iconSizes.bottomNav} />
          ),
        }}
      >
        {() => <ExaminationsStack />}
      </Tab.Screen>
      <Tab.Screen
        name="Leki"
        options={{
          tabBarIcon: ({ color }) => (
            <Pill color={color} size={iconSizes.bottomNav} />
          ),
        }}
      >
        {() => <MedicationsStack />}
      </Tab.Screen>
      <Tab.Screen
        name="Profil"
        options={{
          tabBarIcon: ({ color }) => (
            <User color={color} size={iconSizes.bottomNav} />
          ),
        }}
      >
        {() => <UserScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default AppStack;
