"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('ai', () => ({
    openRouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
    openRouterModel: process.env.OPENROUTER_MODEL ?? 'openai/gpt-oss-120b',
    openRouterBaseUrl: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
    openRouterHttpReferer: process.env.OPENROUTER_HTTP_REFERER ?? '',
    openRouterXTitle: process.env.OPENROUTER_X_TITLE ?? '',
    qwenApiKey: process.env.OPENROUTER_QWEN_API_KEY ?? process.env.OPENROUTER_API_KEY ?? '',
    qwenVisionModel: process.env.QWEN_VISION_MODEL ?? 'qwen/qwen3-vl-235b-a22b-thinking',
    ocrProvider: process.env.OCR_PROVIDER ?? 'stub',
    ocrBackupProvider: process.env.OCR_BACKUP_PROVIDER ?? '',
    ocrCompareMode: process.env.OCR_COMPARE_MODE === 'true',
    qwenMaxPages: Number(process.env.OCR_QWEN_MAX_PAGES ?? 2),
    qwenTimeoutMs: Number(process.env.OCR_QWEN_TIMEOUT_MS ?? 45000),
    ocrEndpoint: process.env.OCR_ENDPOINT ?? ''
}));
//# sourceMappingURL=ai.config.js.map