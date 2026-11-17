import { Directory, File, Paths } from "expo-file-system";
import type { Message } from "../screens/klara/KlaraMessage";

const dir = new Directory(Paths.document, "klara");

function historyFile(userId: string) {
  return new File(dir, `histroira-${userId}.json`);
}

export async function loadHistory(userId: string): Promise<Message[]> {
  const file = historyFile(userId);

  if (!file.exists) {
    return [];
  }
  try {
    const messages: Message[] = JSON.parse(await file.text());
    return messages.map((m) =>
      m.confirmed
        ? m
        : {
            ...m,
            proposal: undefined,
            marking: undefined,
            dose: undefined,
            medication: undefined,
          },
    );
  } catch {
    return [];
  }
}

export function saveHistory(userId: string, messages: Message[]) {
  dir.create({ idempotent: true });
  const file = historyFile(userId);

  if (!file.exists) {
    file.create();
  }
  file.write(JSON.stringify(messages.slice(-100)));
}

export function clearHistory(userId: string) {
  const file = historyFile(userId);
  if (file.exists) {
    file.delete();
  }
}
