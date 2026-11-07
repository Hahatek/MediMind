import { Directory, File, Paths } from "expo-file-system";
import { llama, LlamaLanguageModel } from "@react-native-ai/llama";
import { releaseAllLlama } from "llama.rn";
import {
  generateText,
  stepCountIs,
  wrapLanguageModel,
  type LanguageModelMiddleware,
  type ModelMessage,
} from "ai";
import { badania, loadFamily } from "./tools";
import { formatDate, formatDateLocal } from "../utils/dateFormat";

const MODEL_URL =
  "https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF/resolve/main/gemma-4-E2B-it-Q4_K_M.gguf";

const MODEL_FILE_NAME = "gemma-4-E2B-it-Q4_K_M.gguf";

const modelDir = new Directory(Paths.document, "klara");
const modelFile = new File(modelDir, MODEL_FILE_NAME);

let model: LlamaLanguageModel | null = null;

const SYSTEM_PROMPT =
  "Jesteś Klara, asystentka zdrowia w aplikacji MediMind. Odpowiadasz po polsku, krótko i prostym językiem. Nie stawiasz diagnoz i nie podajesz dawek leków. W sprawach leczenia zawsze odsyłasz do lekarza.";

const naprawSchemat: LanguageModelMiddleware = {
  specificationVersion: "v3",
  transformParams: async ({ params }) => {
    return {
      ...params,
      tools: params.tools?.map((t) =>
        t.type === "function" ? { ...t, parameters: t.inputSchema } : t,
      ),
    };
  },
};

export function isModelReady() {
  return modelFile.exists;
}

export function getModelPath() {
  return modelFile.uri;
}

export async function downloadModel(onProgress: (percent: number) => void) {
  const partFile = new File(modelDir, MODEL_FILE_NAME + ".part");
  modelDir.create({ idempotent: true });

  await File.downloadFileAsync(MODEL_URL, partFile, {
    idempotent: true,
    onProgress: ({ bytesWritten, totalBytes }) => {
      if (totalBytes > 0) {
        onProgress(Math.round((bytesWritten / totalBytes) * 100));
      }
    },
  });

  partFile.rename(MODEL_FILE_NAME);
}

export async function loadModel() {
  if (!model) {
    await releaseAllLlama();
    model = llama.languageModel(getModelPath(), {
      contextParams: { n_ctx: 4096 },
    });
  }
  await model.prepare();
}

export async function unloadModel() {
  await model?.unload();
}

export function getModel() {
  return model;
}

export async function askKlara(
  messages: ModelMessage[],
  onText: (text: string) => void,
) {
  await loadModel();

  const rodzina = await loadFamily();

  const imiona = rodzina
    .filter((m) => !m.isMe)
    .map((m) => m.firstName)
    .join(", ");

  const oRodzinie = imiona
    ? ` Członkowie rodziny użytkownika: ${imiona}. Gdy nie wiesz, o kogo chodzi, dopytaj.`
    : "";

  const { text } = await generateText({
    model: wrapLanguageModel({ model: model!, middleware: naprawSchemat }),
    system: `${SYSTEM_PROMPT} Dzisiaj jest ${formatDate(formatDateLocal(new Date()))}.${oRodzinie}`,
    messages,
    tools: { badania },
    stopWhen: stepCountIs(3),
  });

  onText(text);
  return text;
}
