import { registerAs } from "@nestjs/config";

export default registerAs("ai", () => ({
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openRouterModel: process.env.OPENROUTER_MODEL ?? "arcee-ai/trinity-large-preview:free",
  openRouterBaseUrl:
    process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
  openRouterHttpReferer: process.env.OPENROUTER_HTTP_REFERER ?? "",
  openRouterXTitle: process.env.OPENROUTER_X_TITLE ?? "",
  qwenApiKey:
    process.env.OPENROUTER_QWEN_API_KEY ?? process.env.OPENROUTER_API_KEY ?? "",
  qwenVisionModel:
    process.env.QWEN_VISION_MODEL ?? "qwen/qwen3-vl-235b-a22b-thinking",
  ocrProvider: process.env.OCR_PROVIDER ?? "qwen_vision",
  ocrBackupProvider: process.env.OCR_BACKUP_PROVIDER ?? "tesseract",
  ocrCompareMode: process.env.OCR_COMPARE_MODE === "true",
  qwenMaxPages: Number(process.env.OCR_QWEN_MAX_PAGES ?? 2),
  qwenTimeoutMs: Number(process.env.OCR_QWEN_TIMEOUT_MS ?? 45000),
  ocrEndpoint: process.env.OCR_ENDPOINT ?? "",
}));
