import * as Notification from "expo-notifications";
import { reminderPlanGet, reminderSync } from "../api/reminder";
import { ReminderItem } from "../types/ReminderTypes";
import { CHANNELS } from "./setup";

function paseWallClock(value: string): Date {
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute);
}

async function scheduleItem(item: ReminderItem) {
  await Notification.scheduleNotificationAsync({
    identifier: item.key,
    content: { title: item.title, body: item.body, data: { key: item.key } },
    trigger: {
      type: Notification.SchedulableTriggerInputTypes.DATE,
      date: paseWallClock(item.fireAt),
      channelId: CHANNELS[item.category],
    },
  });
}

async function runSync() {
  const timeZone = "Europe/Warsaw";

  const { granted } = await Notification.getPermissionsAsync();
  if (!granted) {
    await Notification.cancelAllScheduledNotificationsAsync();
    await reminderSync({ localUntil: null, timeZone });

    return;
  }

  const plan = await reminderPlanGet(timeZone);

  await Notification.cancelAllScheduledNotificationsAsync();
  for (const item of plan.items) {
    try {
      await scheduleItem(item);
    } catch (e) {
      console.warn("Ne udało się zapalnować", item.key, e);
    }
  }

  const scheduled = await Notification.getAllScheduledNotificationsAsync();
  const scheduledKeys = new Set(scheduled.map((n) => n.identifier));
  const firsMissing = plan.items.find((item) => !scheduledKeys.has(item.key));

  await reminderSync({
    localUntil: firsMissing?.fireAt ?? plan.coveredUntil,
    timeZone,
  });
}

let ongoingSync: Promise<void> | null = null;

export function syncReminders(): Promise<void> {
  if (ongoingSync === null) {
    ongoingSync = runSync().finally(() => {
      ongoingSync = null;
    });
  }
  return ongoingSync;
}

// jest to funckja która uruchamia synchronizację w tle
export function requestReminderSync() {
  syncReminders().catch((e) =>
    console.warn("Synchronizacja przypomnień nie powiodła się", e),
  );
}
