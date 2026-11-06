import { downloadModel, llama } from "@react-native-ai/llama";
import {
  generateText,
  tool,
  stepCountIs,
  wrapLanguageModel,
  type LanguageModelMiddleware,
} from "ai";
import { z } from "zod";

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

const sprawdzLek = tool({
  description: "Zwracam godzinę przyjmowania leku o podanej nazwie",
  inputSchema: z.object({
    nazwa: z.string().describe("Nazwa leku"),
  }),
  execute: async ({ nazwa }) => {
    console.log("Narzędzie wywołane z:", nazwa);
    return { nazwa, godzina: "09:00" };
  },
});

export async function runSpike() {
  const path = await downloadModel(
    "unsloth/gemma-4-E2B-it-GGUF/gemma-4-E2B-it-Q4_K_M.gguf",
    (progress) => console.log("Pobrano:", progress.percentage, "%"),
  );

  const model = llama.languageModel(path, { contextParams: { n_ctx: 4096 } });

  const { text } = await generateText({
    model,
    prompt: "Czym jest ciśnienie krwi?",
  });

  console.log("Odpowiedż:", text);
}

export async function runSpikeB() {
  const path = await downloadModel(
    "unsloth/gemma-4-E2B-it-GGUF/gemma-4-E2B-it-Q4_K_M.gguf",
  );

  const model = llama.languageModel(path, { contextParams: { n_ctx: 4096 } });

  const { text, steps } = await generateText({
    model,
    prompt: "O której biorę Euthyrox?",
    tools: { sprawdzLek },
    stopWhen: stepCountIs(2),
  });

  console.log(
    "Kroki:",
    JSON.stringify(
      steps.map((s) => s.toolCalls),
      null,
      2,
    ),
  );
  console.log("Odpowiedź:", text);
}

export async function runSpikeC() {
  const path = await downloadModel(
    "unsloth/gemma-4-E2B-it-GGUF/gemma-4-E2B-it-Q4_K_M.gguf",
  );

  const model = llama.languageModel(path, { contextParams: { n_ctx: 4096 } });
  const naprawionyModel = wrapLanguageModel({
    model,
    middleware: naprawSchemat,
  });

  const { text, steps } = await generateText({
    model: naprawionyModel,
    prompt: "O której biorę Euthyrox?",
    tools: { sprawdzLek },
    stopWhen: stepCountIs(2),
  });

  console.log(
    "Kroki:",
    JSON.stringify(
      steps.map((s) => s.toolCalls),
      null,
      2,
    ),
  );
  console.log("Odpowiedź:", text);
}
