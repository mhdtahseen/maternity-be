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
    this.model = this.configService.get<string>('ai.openRouterModel', 'arcee-ai/trinity-large-preview:free');
  }

  async analyzeMedicalText(ocrText: string): Promise<LlmMedicalExtraction> {
    if (!this.apiKey) {
      return this.createFallbackExtraction(ocrText, 'No OpenRouter API key configured');
    }

    try {
      // First API call with reasoning - initial extraction
      const systemPrompt = [
        'You are a medical document extraction engine for pregnancy care records.',
        'RESPOND ONLY with valid JSON. Do not include any markdown, explanations, or additional text.',
        'Use the provided schema. Avoid hallucinations; use null/empty for unknown fields.',
        'The JSON must be valid and parseable.'
      ].join(' ');

      const userPrompt = `Extract medical information from this OCR text and return ONLY a JSON object (no markdown, no extra text):

{
  "authenticity": {
    "score": 0-1,
    "reasons": ["string"],
    "redFlags": ["string"]
  },
  "classification": {
    "documentType": "PRESCRIPTION|LAB_REPORT|BILL|SCAN|MRI|ULTRASOUND|OTHER"
  },
  "extracted": {
    "doctor": "string or null",
    "hospital": "string or null",
    "documentDate": "YYYY-MM-DD or null",
    "pregnancyWeek": "number or null",
    "medicines": []
  },
  "explanation": "explanation of findings",
  "humanSummary": "4-8 sentence patient-friendly summary",
  "tags": ["string"],
  "timelineEvents": []
}

OCR TEXT TO ANALYZE:
${ocrText}`;

      // First API call with reasoning enabled
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
        throw new Error(`OpenRouter request failed with status ${response.status}`);
      }

      const body = await response.json();
      const assistantMessage = body?.choices?.[0]?.message;

      if (!assistantMessage?.content) {
        throw new Error(`Empty Trinity response. Response: ${JSON.stringify(body)}`);
      }

      // Trinity might return content with reasoning info, extract just the text content
      const content = typeof assistantMessage.content === 'string' 
        ? assistantMessage.content 
        : JSON.stringify(assistantMessage.content);

      // Parse the initial extraction with reasoning
      const parsed = this.parseModelJson(content);
      
      // Validate the first response to ensure it's correct
      try {
        return extractionSchema.parse(parsed);
      } catch (validationError) {
        // If validation fails, try a refinement step
        // Second API call - ask Trinity to refine/verify the extraction
        const refinementPrompt = `The previous extraction had issues. Please re-extract the medical data from the OCR text, ensuring:
1. All fields are accurately extracted
2. The humanSummary is clear and patient-friendly
3. Return ONLY valid JSON matching the required schema

Original OCR text to extract from:
${ocrText}`;
      
        const response2 = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
              { role: 'assistant', content: assistantMessage.content },
              { role: 'user', content: refinementPrompt }
            ],
            reasoning: { enabled: true }
          })
        });

        if (!response2.ok) {
          throw validationError; // Re-throw original validation error
        }

        const body2 = await response2.json();
        const refinedMessage = body2?.choices?.[0]?.message?.content;

        if (refinedMessage) {
          const refinedParsed = this.parseModelJson(refinedMessage);
          return extractionSchema.parse(refinedParsed);
        }
        
        throw validationError;
      }
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

    try {
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

      // First API call with reasoning
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
      const assistantMessage = body?.choices?.[0]?.message;

      if (!assistantMessage?.content) {
        return 'I could not generate an answer from this report.';
      }

      // Attempt to refine the answer if it's unclear
      const response2 = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
            { role: 'assistant', content: assistantMessage.content },
            {
              role: 'user',
              content: 'Please ensure your answer is clear, accurate, and easy to understand for someone without medical training. Provide your best answer based on the report.'
            }
          ],
          reasoning: { enabled: true }
        })
      });

      if (!response2.ok) {
        // Return original answer if refinement fails
        return typeof assistantMessage.content === 'string'
          ? assistantMessage.content.trim()
          : JSON.stringify(assistantMessage.content);
      }

      const body2 = await response2.json();
      const refinedContent = body2?.choices?.[0]?.message?.content;

      if (refinedContent) {
        return typeof refinedContent === 'string' ? refinedContent.trim() : JSON.stringify(refinedContent);
      }

      return typeof assistantMessage.content === 'string'
        ? assistantMessage.content.trim()
        : JSON.stringify(assistantMessage.content);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      if (context.summary) {
        return `Could not generate AI response (${message}). Based on the summary: ${context.summary}`;
      }
      return `Could not generate AI response (${message}). Please try again later.`;
    }
  }

  private parseModelJson(content: unknown): unknown {
    if (typeof content !== 'string') {
      return content;
    }

    const trimmed = content.trim();
    try {
      return JSON.parse(trimmed);
    } catch {
      // Try to find JSON object in the content
      const firstBrace = trimmed.indexOf('{');
      const lastBrace = trimmed.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace <= firstBrace) {
        // Try to find JSON array as fallback
        const firstBracket = trimmed.indexOf('[');
        const lastBracket = trimmed.lastIndexOf(']');
        
        if (firstBracket === -1 || lastBracket <= firstBracket) {
          throw new Error(`Response does not contain a JSON object. Content: ${trimmed.substring(0, 200)}`);
        }
        
        const candidate = trimmed.slice(firstBracket, lastBracket + 1);
        try {
          return JSON.parse(candidate);
        } catch (e) {
          throw new Error(`Invalid JSON array found. Error: ${e instanceof Error ? e.message : 'unknown'}`);
        }
      }

      const candidate = trimmed.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) {
        throw new Error(`Invalid JSON object found. Error: ${e instanceof Error ? e.message : 'unknown'}`);
      }
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
