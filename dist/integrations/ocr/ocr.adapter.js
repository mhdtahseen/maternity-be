"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const util_1 = require("util");
const minio_client_1 = require("../storage/minio.client");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let OcrAdapter = class OcrAdapter {
    constructor(configService, minioClient) {
        this.configService = configService;
        this.minioClient = minioClient;
    }
    async extractTextFromObject(bucket, objectKey) {
        const primaryProvider = this.normalizeProvider(this.configService.get('ai.ocrProvider', 'stub')) ?? 'stub';
        const backupProvider = this.normalizeProvider(this.configService.get('ai.ocrBackupProvider', ''));
        const compareMode = this.configService.get('ai.ocrCompareMode', false);
        const extension = this.resolveExtension(objectKey);
        const shouldLoadBuffer = primaryProvider !== 'stub' || backupProvider !== null;
        if (!shouldLoadBuffer) {
            return this.placeholderResult(bucket, objectKey);
        }
        const sourceBuffer = await this.minioClient.getObjectBuffer(bucket, objectKey);
        let primary = null;
        let backup = null;
        let primaryError;
        let backupError;
        try {
            primary = await this.extractWithProvider(primaryProvider, sourceBuffer, extension, bucket, objectKey);
        }
        catch (error) {
            primaryError = error instanceof Error ? error.message : 'Primary OCR failed';
        }
        if (backupProvider && backupProvider !== primaryProvider) {
            try {
                backup = await this.extractWithProvider(backupProvider, sourceBuffer, extension, bucket, objectKey);
            }
            catch (error) {
                backupError = error instanceof Error ? error.message : 'Backup OCR failed';
            }
        }
        if (!primary && !backup) {
            throw new Error(`OCR failed. primary=${primaryError ?? 'n/a'}; backup=${backupError ?? 'n/a'}`);
        }
        if (!primary && backup) {
            return {
                ...backup,
                comparison: {
                    compareMode,
                    selectedProvider: backup.provider,
                    primaryProvider,
                    primaryChars: 0,
                    primaryConfidence: 0,
                    backupProvider: backup.provider,
                    backupChars: backup.text.length,
                    backupConfidence: backup.confidence,
                    usedFallback: true,
                    primaryError,
                    backupError,
                    backupPreview: this.previewText(backup.text)
                }
            };
        }
        if (!primary) {
            throw new Error('OCR primary output missing');
        }
        const primaryUseful = primary.provider !== 'stub' && this.isUsefulText(primary.text);
        const backupUseful = Boolean(backup && backup.provider !== 'stub' && this.isUsefulText(backup.text));
        const selected = !primaryUseful && backup && backupUseful ? backup : primary;
        if (!backup && !compareMode && selected === primary) {
            return primary;
        }
        return {
            ...selected,
            comparison: {
                compareMode,
                selectedProvider: selected.provider,
                primaryProvider: primary.provider,
                primaryChars: primary.text.length,
                primaryConfidence: primary.confidence,
                backupProvider: backup?.provider ?? null,
                backupChars: backup?.text.length ?? 0,
                backupConfidence: backup?.confidence ?? 0,
                usedFallback: selected.provider !== primary.provider,
                primaryError,
                backupError,
                primaryPreview: this.previewText(primary.text),
                backupPreview: this.previewText(backup?.text ?? '')
            }
        };
    }
    async extractWithProvider(provider, sourceBuffer, extension, bucket, objectKey) {
        switch (provider) {
            case 'tesseract':
                return this.extractWithTesseract(sourceBuffer, extension, objectKey);
            case 'qwen_vision':
                return this.extractWithQwenVision(sourceBuffer, extension, objectKey);
            case 'stub':
            default:
                return this.placeholderResult(bucket, objectKey);
        }
    }
    async extractWithTesseract(sourceBuffer, extension, objectKey) {
        const tempDir = await fs_1.promises.mkdtemp((0, path_1.join)((0, os_1.tmpdir)(), 'ocr-'));
        const sourcePath = (0, path_1.join)(tempDir, `source${extension}`);
        await fs_1.promises.writeFile(sourcePath, sourceBuffer);
        try {
            if (extension === '.pdf') {
                const result = await this.extractFromPdf(sourcePath, tempDir);
                return { ...result, provider: 'tesseract' };
            }
            const imageResult = await this.extractFromImage(sourcePath);
            return {
                text: imageResult.text.trim(),
                confidence: imageResult.confidence,
                pages: 1,
                provider: 'tesseract'
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'unknown OCR error';
            throw new Error(`Tesseract OCR failed for ${objectKey}: ${message}`);
        }
        finally {
            await fs_1.promises.rm(tempDir, { recursive: true, force: true });
        }
    }
    async extractWithQwenVision(sourceBuffer, extension, objectKey) {
        const apiKey = this.configService.get('ai.qwenApiKey', '');
        const baseUrl = this.configService.get('ai.openRouterBaseUrl', 'https://openrouter.ai/api/v1');
        const model = this.configService.get('ai.qwenVisionModel', 'qwen/qwen3-vl-235b-a22b-thinking');
        const maxPagesRaw = this.configService.get('ai.qwenMaxPages', 2);
        const timeoutMsRaw = this.configService.get('ai.qwenTimeoutMs', 45000);
        const maxPages = Number.isFinite(maxPagesRaw) ? Math.min(Math.max(Math.floor(maxPagesRaw), 1), 6) : 2;
        const timeoutMs = Number.isFinite(timeoutMsRaw) ? Math.min(Math.max(Math.floor(timeoutMsRaw), 5000), 120000) : 45000;
        if (!apiKey) {
            throw new Error('OPENROUTER_QWEN_API_KEY is missing');
        }
        const imageDataUrls = extension === '.pdf'
            ? await this.convertPdfToImageDataUrls(sourceBuffer, maxPages)
            : [this.toDataUrl(sourceBuffer, this.mimeTypeFromExtension(extension))];
        if (imageDataUrls.length === 0) {
            return { text: '', confidence: 0, pages: 0, provider: 'qwen_vision' };
        }
        const content = [
            {
                type: 'text',
                text: [
                    'Extract all visible text from this medical report.',
                    'Return plain text only, preserving line breaks.',
                    'If multiple pages/images are provided, group output by page with labels like "Page 1".',
                    'Do not summarize and do not add medical interpretation.'
                ].join(' ')
            }
        ];
        for (const url of imageDataUrls) {
            content.push({
                type: 'image_url',
                image_url: { url }
            });
        }
        const headers = {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };
        const referer = this.configService.get('ai.openRouterHttpReferer', '').trim();
        const xTitle = this.configService.get('ai.openRouterXTitle', '').trim();
        if (referer) {
            headers['HTTP-Referer'] = referer;
        }
        if (xTitle) {
            headers['X-Title'] = xTitle;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        let response;
        try {
            response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers,
                signal: controller.signal,
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content }]
                })
            });
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`Qwen OCR request timed out after ${timeoutMs}ms`);
            }
            throw error;
        }
        finally {
            clearTimeout(timer);
        }
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Qwen OCR request failed (${response.status}): ${errorBody.slice(0, 200)}`);
        }
        const body = await response.json();
        const messageContent = body?.choices?.[0]?.message?.content;
        const text = this.normalizeText(this.extractMessageContentText(messageContent));
        return {
            text,
            confidence: this.isUsefulText(text) ? 0.86 : 0.45,
            pages: imageDataUrls.length,
            provider: 'qwen_vision'
        };
    }
    async extractFromPdf(pdfPath, tempDir) {
        const imagePrefix = (0, path_1.join)(tempDir, 'page');
        await execFileAsync('pdftoppm', ['-png', '-r', '350', pdfPath, imagePrefix], { maxBuffer: 30 * 1024 * 1024 });
        const files = await fs_1.promises.readdir(tempDir);
        const pageImages = files
            .filter((name) => /^page-\d+\.png$/i.test(name))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
            .map((name) => (0, path_1.join)(tempDir, name));
        const pageCount = await this.getPdfPageCount(pdfPath);
        const totalPages = Math.max(pageCount, pageImages.length);
        if (totalPages === 0) {
            return { text: '', confidence: 0, pages: 0, provider: 'tesseract' };
        }
        const pageTexts = [];
        let confidenceTotal = 0;
        let confidenceCount = 0;
        for (let page = 1; page <= totalPages; page += 1) {
            const directText = await this.extractPdfPageText(pdfPath, page, tempDir);
            if (this.isUsefulText(directText)) {
                pageTexts.push(this.normalizeText(directText));
                confidenceTotal += 0.99;
                confidenceCount += 1;
                continue;
            }
            const imagePath = pageImages[page - 1];
            if (!imagePath) {
                continue;
            }
            const imageResult = await this.extractFromImage(imagePath);
            if (!this.isUsefulText(imageResult.text)) {
                continue;
            }
            pageTexts.push(this.normalizeText(imageResult.text));
            confidenceTotal += imageResult.confidence;
            confidenceCount += 1;
        }
        const mergedText = pageTexts
            .map((text, idx) => `Page ${idx + 1}\n${text}`)
            .join('\n\n')
            .trim();
        return {
            text: mergedText,
            confidence: confidenceCount > 0 ? confidenceTotal / confidenceCount : 0,
            pages: totalPages,
            provider: 'tesseract'
        };
    }
    async extractFromImage(imagePath) {
        const { stdout } = await execFileAsync('tesseract', [imagePath, 'stdout', '-l', 'eng', 'tsv'], {
            maxBuffer: 20 * 1024 * 1024
        });
        return this.parseTsvOutput(stdout);
    }
    parseTsvOutput(tsv) {
        const lines = tsv.split('\n').filter(Boolean);
        if (lines.length <= 1) {
            return { text: '', confidence: 0 };
        }
        const lineWords = new Map();
        let confidenceTotal = 0;
        let confidenceCount = 0;
        for (let i = 1; i < lines.length; i += 1) {
            const row = lines[i];
            if (!row) {
                continue;
            }
            const columns = row.split('\t');
            if (columns.length < 12) {
                continue;
            }
            const text = columns[11]?.trim();
            const confidence = Number(columns[10]);
            if (!text) {
                continue;
            }
            if (Number.isNaN(confidence) || confidence < 30) {
                continue;
            }
            const key = `${columns[1]}-${columns[2]}-${columns[3]}-${columns[4]}`;
            const bucket = lineWords.get(key) ?? [];
            bucket.push(text);
            lineWords.set(key, bucket);
            if (!Number.isNaN(confidence) && confidence >= 0) {
                confidenceTotal += confidence;
                confidenceCount += 1;
            }
        }
        const average = confidenceCount > 0 ? confidenceTotal / confidenceCount / 100 : 0;
        const text = Array.from(lineWords.values())
            .map((words) => words.join(' '))
            .join('\n')
            .trim();
        return {
            text,
            confidence: Number.isFinite(average) ? average : 0
        };
    }
    resolveExtension(objectKey) {
        const cleaned = (0, path_1.basename)(objectKey.split('?')[0] ?? '');
        const extension = (0, path_1.extname)(cleaned).toLowerCase();
        return extension || '.bin';
    }
    async getPdfPageCount(pdfPath) {
        try {
            const { stdout } = await execFileAsync('pdfinfo', [pdfPath], { maxBuffer: 4 * 1024 * 1024 });
            const match = stdout.match(/Pages:\s+(\d+)/i);
            return match ? Math.max(Number(match[1]), 0) : 0;
        }
        catch {
            return 0;
        }
    }
    async extractPdfPageText(pdfPath, page, tempDir) {
        const outputPath = (0, path_1.join)(tempDir, `page-${page}.txt`);
        await execFileAsync('pdftotext', ['-f', String(page), '-l', String(page), '-layout', '-nopgbrk', pdfPath, outputPath], {
            maxBuffer: 20 * 1024 * 1024
        });
        return fs_1.promises.readFile(outputPath, 'utf8');
    }
    isUsefulText(text) {
        const normalized = this.normalizeText(text);
        if (normalized.length < 24) {
            return false;
        }
        const letters = (normalized.match(/[A-Za-z]/g) ?? []).length;
        return letters >= 12;
    }
    normalizeText(text) {
        return text
            .replace(/\r/g, '')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/[ \t]{2,}/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }
    normalizeProvider(value) {
        const normalized = (value ?? '').trim().toLowerCase();
        if (!normalized) {
            return null;
        }
        if (normalized === 'tesseract') {
            return 'tesseract';
        }
        if (normalized === 'qwen' || normalized === 'qwen_vision' || normalized === 'qwen-vision') {
            return 'qwen_vision';
        }
        if (normalized === 'stub' || normalized === 'placeholder') {
            return 'stub';
        }
        return 'stub';
    }
    async convertPdfToImageDataUrls(pdfBuffer, maxPages) {
        const tempDir = await fs_1.promises.mkdtemp((0, path_1.join)((0, os_1.tmpdir)(), 'qwen-ocr-'));
        const pdfPath = (0, path_1.join)(tempDir, 'source.pdf');
        const imagePrefix = (0, path_1.join)(tempDir, 'page');
        await fs_1.promises.writeFile(pdfPath, pdfBuffer);
        try {
            await execFileAsync('pdftoppm', ['-png', '-r', '220', pdfPath, imagePrefix], { maxBuffer: 30 * 1024 * 1024 });
            const files = await fs_1.promises.readdir(tempDir);
            const pageImages = files
                .filter((name) => /^page-\d+\.png$/i.test(name))
                .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
                .slice(0, maxPages);
            const dataUrls = [];
            for (const imageName of pageImages) {
                const buffer = await fs_1.promises.readFile((0, path_1.join)(tempDir, imageName));
                dataUrls.push(this.toDataUrl(buffer, 'image/png'));
            }
            return dataUrls;
        }
        finally {
            await fs_1.promises.rm(tempDir, { recursive: true, force: true });
        }
    }
    mimeTypeFromExtension(extension) {
        switch (extension) {
            case '.png':
                return 'image/png';
            case '.jpg':
            case '.jpeg':
                return 'image/jpeg';
            case '.webp':
                return 'image/webp';
            case '.tif':
            case '.tiff':
                return 'image/tiff';
            case '.bmp':
                return 'image/bmp';
            default:
                return 'application/octet-stream';
        }
    }
    toDataUrl(buffer, mimeType) {
        return `data:${mimeType};base64,${buffer.toString('base64')}`;
    }
    extractMessageContentText(content) {
        if (typeof content === 'string') {
            return content;
        }
        if (Array.isArray(content)) {
            return content
                .map((item) => {
                if (typeof item === 'string') {
                    return item;
                }
                if (item && typeof item === 'object' && 'text' in item) {
                    const text = item.text;
                    return typeof text === 'string' ? text : '';
                }
                return '';
            })
                .filter(Boolean)
                .join('\n');
        }
        return '';
    }
    previewText(text) {
        return this.normalizeText(text).slice(0, 400);
    }
    placeholderResult(bucket, objectKey) {
        return {
            text: `OCR placeholder text for ${bucket}/${objectKey}`,
            confidence: 0.92,
            pages: 1,
            provider: 'stub'
        };
    }
};
exports.OcrAdapter = OcrAdapter;
exports.OcrAdapter = OcrAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        minio_client_1.MinioClientService])
], OcrAdapter);
//# sourceMappingURL=ocr.adapter.js.map