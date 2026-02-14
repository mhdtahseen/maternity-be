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
exports.OpenRouterClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const zod_1 = require("zod");
const medicineSchema = zod_1.z.object({
    name: zod_1.z.string(),
    dosage: zod_1.z.string().nullable().optional(),
    frequency: zod_1.z.string().nullable().optional(),
    reason: zod_1.z.string().nullable().optional()
});
const timelineEventSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    eventAt: zod_1.z.string(),
    tags: zod_1.z.array(zod_1.z.string()).default([])
});
const extractionSchema = zod_1.z.object({
    authenticity: zod_1.z.object({
        score: zod_1.z.number().min(0).max(1),
        reasons: zod_1.z.array(zod_1.z.string()).default([]),
        redFlags: zod_1.z.array(zod_1.z.string()).default([])
    }),
    classification: zod_1.z.object({
        documentType: zod_1.z.enum(['PRESCRIPTION', 'LAB_REPORT', 'BILL', 'SCAN', 'MRI', 'ULTRASOUND', 'OTHER'])
    }),
    extracted: zod_1.z.object({
        doctor: zod_1.z.string().nullable().optional(),
        hospital: zod_1.z.string().nullable().optional(),
        documentDate: zod_1.z.string().nullable().optional(),
        pregnancyWeek: zod_1.z.number().min(1).max(45).nullable().optional(),
        medicines: zod_1.z.array(medicineSchema).default([])
    }),
    explanation: zod_1.z.string().default(''),
    humanSummary: zod_1.z.string().default(''),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    timelineEvents: zod_1.z.array(timelineEventSchema).default([])
});
let OpenRouterClient = class OpenRouterClient {
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('ai.openRouterApiKey', '');
        this.baseUrl = this.configService.get('ai.openRouterBaseUrl', 'https://openrouter.ai/api/v1');
        this.model = this.configService.get('ai.openRouterModel', 'openai/gpt-oss-120b');
    }
    async analyzeMedicalText(ocrText) {
        if (!this.apiKey) {
            return this.createFallbackExtraction(ocrText, 'No OpenRouter API key configured');
        }
        const systemPrompt = [
            'You are a medical document extraction engine for pregnancy care records.',
            'Return valid JSON only, no markdown, no commentary.',
            'Use the provided schema and avoid hallucinations; use null/empty if unknown.',
            'humanSummary must be easy for non-medical parents to understand.',
            'Prefer a concise, readable explanation of findings, risks, and recommended follow-up.'
        ].join(' ');
        const userPrompt = JSON.stringify({
            task: 'Extract and classify medical pregnancy document content',
            schema: {
                authenticity: { score: 'number 0-1', reasons: 'string[]', redFlags: 'string[]' },
                classification: { documentType: 'PRESCRIPTION|LAB_REPORT|BILL|SCAN|MRI|ULTRASOUND|OTHER' },
                extracted: {
                    doctor: 'string?',
                    hospital: 'string?',
                    documentDate: 'YYYY-MM-DD?',
                    pregnancyWeek: 'number?',
                    medicines: [{ name: 'string', dosage: 'string?', frequency: 'string?', reason: 'string?' }]
                },
                explanation: 'string',
                humanSummary: '4-8 sentence patient-friendly summary in plain English, include key findings and next-step guidance if present',
                tags: 'string[]',
                timelineEvents: [{ title: 'string', description: 'string', eventAt: 'ISO datetime', tags: 'string[]' }]
            },
            rules: [
                'If OCR text is noisy, rely only on clearly present facts.',
                'Do not claim measurements, diagnosis, or doctor details unless explicit in OCR.',
                'If uncertain, clearly state uncertainty in humanSummary.'
            ],
            ocrText
        });
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                reasoning: { enabled: true },
                response_format: {
                    type: 'json_object'
                }
            })
        });
        try {
            if (!response.ok) {
                throw new Error(`OpenRouter request failed with status ${response.status}`);
            }
            const body = await response.json();
            const content = body?.choices?.[0]?.message?.content;
            if (!content) {
                throw new Error('Empty OpenRouter response');
            }
            const parsed = this.parseModelJson(content);
            return extractionSchema.parse(parsed);
        }
        catch (error) {
            const reason = error instanceof Error ? error.message : 'Unknown OpenRouter parsing error';
            return this.createFallbackExtraction(ocrText, reason);
        }
    }
    async answerDocumentQuestion(context, question) {
        const trimmedQuestion = question.trim();
        if (!trimmedQuestion) {
            return 'Please ask a question about the report.';
        }
        if (!this.apiKey) {
            if (context.summary) {
                return `AI chat is unavailable right now. Based on the summary: ${context.summary}`;
            }
            return 'AI chat is unavailable right now. Please try again later.';
        }
        const systemPrompt = [
            'You are a helpful maternity-report assistant.',
            'Answer only from the provided report context.',
            'Keep wording simple for non-medical users.',
            'If the answer is not present, clearly say it is not available in this report.'
        ].join(' ');
        const userPrompt = JSON.stringify({
            report: {
                type: context.documentType ?? null,
                summary: context.summary ?? null,
                doctorName: context.doctorName ?? null,
                hospitalName: context.hospitalName ?? null,
                pregnancyWeek: context.pregnancyWeek ?? null,
                text: context.reportText ?? null
            },
            question: trimmedQuestion,
            answerStyle: {
                tone: 'clear and calm',
                length: '2-6 sentences',
                include_caution: 'if uncertain or unavailable'
            }
        });
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                reasoning: { enabled: true }
            })
        });
        if (!response.ok) {
            throw new Error(`OpenRouter chat request failed with status ${response.status}`);
        }
        const body = await response.json();
        const content = body?.choices?.[0]?.message?.content;
        if (!content) {
            return 'I could not generate an answer from this report.';
        }
        return typeof content === 'string' ? content.trim() : JSON.stringify(content);
    }
    parseModelJson(content) {
        if (typeof content !== 'string') {
            return content;
        }
        const trimmed = content.trim();
        try {
            return JSON.parse(trimmed);
        }
        catch {
            const firstBrace = trimmed.indexOf('{');
            const lastBrace = trimmed.lastIndexOf('}');
            if (firstBrace === -1 || lastBrace <= firstBrace) {
                throw new Error('Response does not contain a JSON object');
            }
            const candidate = trimmed.slice(firstBrace, lastBrace + 1);
            return JSON.parse(candidate);
        }
    }
    createFallbackExtraction(ocrText, reason) {
        const documentType = this.inferDocumentType(ocrText);
        const condensed = ocrText.replace(/^OCR placeholder text for\s+/i, '').slice(0, 200).trim();
        return extractionSchema.parse({
            authenticity: { score: 0.7, reasons: [reason], redFlags: [] },
            classification: { documentType },
            extracted: { medicines: [] },
            explanation: `Fallback extraction used: ${reason}`,
            humanSummary: condensed ? `Auto-summary: ${condensed}` : 'Auto-summary unavailable from OCR text.',
            tags: ['fallback-extraction', documentType.toLowerCase()],
            timelineEvents: []
        });
    }
    inferDocumentType(text) {
        const normalized = text.toLowerCase();
        if (/ultrasound|sonography|anomaly\s*scan|nt\s*scan/.test(normalized)) {
            return 'ULTRASOUND';
        }
        if (/\bmri\b|magnetic resonance/.test(normalized)) {
            return 'MRI';
        }
        if (/\bscan\b|ct\b|x[- ]?ray/.test(normalized)) {
            return 'SCAN';
        }
        if (/prescription|\brx\b|dosage|tablet|capsule/.test(normalized)) {
            return 'PRESCRIPTION';
        }
        if (/lab|blood|cbc|hemoglobin|test report/.test(normalized)) {
            return 'LAB_REPORT';
        }
        if (/invoice|bill|amount due|payment/.test(normalized)) {
            return 'BILL';
        }
        return 'OTHER';
    }
};
exports.OpenRouterClient = OpenRouterClient;
exports.OpenRouterClient = OpenRouterClient = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OpenRouterClient);
//# sourceMappingURL=openrouter.client.js.map