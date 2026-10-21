export type ReminderCategory = "exams" | "meds" | "family";

export type ReminderItem = {
  key: string;
  category: ReminderCategory;
  fireAt: string;
  title: string;
  body: string;
};

export type ReminderPlan = {
  items: ReminderItem[];
  coveredUntil: string;
};

export type ReminderSyncRequest = {
  localUntil: string | null;
  timeZone: string;
};
