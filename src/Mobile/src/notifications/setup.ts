import { Platform } from "react-native";
import * as Notification from "expo-notifications";

export const CHANNELS = {
  exams: "badania",
  meds: "leki",
  family: "rodzina",
} as const;

Notification.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupNotificationChannels() {
  if (Platform.OS !== "android") {
    return;
  }

  const common = {
    importance: Notification.AndroidImportance.HIGH,
    lockscreenVisibility: Notification.AndroidNotificationVisibility.PRIVATE,
  };

  await Notification.setNotificationChannelAsync(CHANNELS.exams, {
    ...common,
    name: "Badania",
  });

  await Notification.setNotificationChannelAsync(CHANNELS.meds, {
    ...common,
    name: "Leki",
  });

  await Notification.setNotificationChannelAsync(CHANNELS.family, {
    ...common,
    name: "Rodzina",
  });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notification.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  if (!current.canAskAgain) {
    return false;
  }

  const requested = await Notification.requestPermissionsAsync();
  return requested.granted;
}
