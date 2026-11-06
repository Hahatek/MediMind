import { Directory, File, Paths } from "expo-file-system";

const MODEL_URL =
  "https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF/resolve/main/gemma-4-E2B-it-Q4_K_M.gguf";
const MODEL_FILE_NAME = "gemma-4-E2B-it-Q4_K_M.gguf";

const modelDir = new Directory(Paths.document, "klara");
const modelFile = new File(modelDir, MODEL_FILE_NAME);

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
