import * as Notification from "expo-notifications";
import { medicationIntakeCreate } from "../api/medicationIntake";
import { TAKEN_ACTION } from "./setup";

export async function handleNotificationResponse(
  response: Notification.NotificationResponse,
) {
  if (response.actionIdentifier !== TAKEN_ACTION) {
    return;
  }

  const key = response.notification.request.content.data?.key;
  if (typeof key !== "string") {
    return;
  }

  const [kind, scheduleId, date] = key.split(":");
  if (kind !== "dose") {
    return;
  }

  await medicationIntakeCreate({
    medicationScheduleId: scheduleId,
    date,
    status: "Taken",
  });

  await Notification.dismissNotificationAsync(
    response.notification.request.identifier,
  );
}
