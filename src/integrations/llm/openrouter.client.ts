import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';

const medicineSchema = z.object({
  name: z.string(),
  dosage: z.string().nullable().optional(),
  frequency: z.string().nullable().optional(),
  reason: z.string().nullable().optional()
});

const timelineEventSchema = z.object({
  title: z.string(),
  description: z.string(),
  eventAt: z.string(),
  tags: z.array(z.string()).default([])
});

const extractionSchema = z.object({
  authenticity: z.object({
    score: z.number().min(0).max(1),
    reasons: z.array(z.string()).default([]),
    redFlags: z.array(z.string()).default([])
  }),
  classification: z.object({
    documentType: z.enum(['PRESCRIPTION', 'LAB_REPORT', 'BILL', 'SCAN', 'MRI', 'ULTRASOUND', 'OTHER'])
  }),
  extracted: z.object({
    doctor: z.string().nullable().optional(),
    hospital: z.string().nullable().optional(),
    documentDate: z.string().nullable().optional(),
    pregnancyWeek: z.number().min(1).max(45).nullable().optional(),
    medicines: z.array(medicineSchema).default([])
  }),
  explanation: z.string().default(''),
  humanSummary: z.string().default(''),
  tags: z.array(z.string()).default([]),
  timelineEvents: z.array(timelineEventSchema).default([])
});

export type LlmMedicalExtraction = z.infer<typeof extractionSchema>;
type LlmDocumentType = LlmMedicalExtraction['classification']['documentType'];

@Injectable()
export class OpenRouterClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ai.openRouterApiKey', '');
    this.baseUrl = this.configService.get<string>('ai.openRouterBaseUrl', 'https://openrouter.ai/api/v1');
    this.model = this.configService.get<string>('ai.openRouterModel', 'openai/gpt-oss-120b');
  }

  async analyzeMedicalText(ocrText: string): Promise<LlmMedicalExtraction> {
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
        humanSummary:
          '4-8 sentence patient-friendly summary in plain English, include key findings and next-step guidance if present',
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
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown OpenRouter parsing error';
      return this.createFallbackExtraction(ocrText, reason);
    }
  }

  async answerDocumentQuestion(
    context: {
      documentType?: string | null;
      summary?: string | null;
      doctorName?: string | null;
      hospitalName?: string | null;
      pregnancyWeek?: number | null;
      reportText?: string | null;
    },
    question: string
  ): Promise<string> {
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

  private parseModelJson(content: unknown): unknown {
    if (typeof content !== 'string') {
      return content;
    }

    const trimmed = content.trim();
    try {
      return JSON.parse(trimmed);
    } catch {
      const firstBrace = trimmed.indexOf('{');
      const lastBrace = trimmed.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace <= firstBrace) {
        throw new Error('Response does not contain a JSON object');
      }

      const candidate = trimmed.slice(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }
  }

  private createFallbackExtraction(ocrText: string, reason: string): LlmMedicalExtraction {
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

  private inferDocumentType(text: string): LlmDocumentType {
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
}
