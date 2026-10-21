import { ReminderPlan, ReminderSyncRequest } from "../types/ReminderTypes";
import instance from "./client";

export async function reminderPlanGet(timeZone: string) {
  const response = await instance.get<ReminderPlan>("/api/reminders/plan", {
    params: { timeZone },
  });
  return response.data;
}

export async function reminderSync(data: ReminderSyncRequest) {
  await instance.post("/api/reminders/sync", data);
}
