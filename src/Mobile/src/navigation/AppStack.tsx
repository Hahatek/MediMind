import HomeScreen from "../screens/HomeScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ExaminationsListScreen from "../screens/ExaminationsListScreen";
import ExaminationsStack from "./ExaminationsStack";
import { ClipboardPlus, Home, Pill, User } from "lucide-react-native";
import UserScreen from "../screens/UserScreen";
import MedicationListScreen from "../screens/MedicationListScreen";
import MedicationsStack from "./MedicationsStack";

type Props = {
  onLogout: () => void;
};

type AppStackList = {
  Home: undefined;
  Badania: undefined;
  Profil: undefined;
  Leki: undefined;
};

const Tab = createBottomTabNavigator<AppStackList>();

function AppStack({ onLogout }: Props) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#178E9D",
        tabBarInactiveTintColor: "#999999",
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      >
        {() => <HomeScreen onLogout={onLogout} />}
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
