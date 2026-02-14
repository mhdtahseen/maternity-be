import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
declare const extractionSchema: z.ZodObject<{
    authenticity: z.ZodObject<{
        score: z.ZodNumber;
        reasons: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        redFlags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        score: number;
        reasons: string[];
        redFlags: string[];
    }, {
        score: number;
        reasons?: string[] | undefined;
        redFlags?: string[] | undefined;
    }>;
    classification: z.ZodObject<{
        documentType: z.ZodEnum<["PRESCRIPTION", "LAB_REPORT", "BILL", "SCAN", "MRI", "ULTRASOUND", "OTHER"]>;
    }, "strip", z.ZodTypeAny, {
        documentType: "PRESCRIPTION" | "LAB_REPORT" | "BILL" | "SCAN" | "MRI" | "ULTRASOUND" | "OTHER";
    }, {
        documentType: "PRESCRIPTION" | "LAB_REPORT" | "BILL" | "SCAN" | "MRI" | "ULTRASOUND" | "OTHER";
    }>;
    extracted: z.ZodObject<{
        doctor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        hospital: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        documentDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        pregnancyWeek: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        medicines: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            dosage: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            frequency: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            reason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            dosage?: string | null | undefined;
            frequency?: string | null | undefined;
            reason?: string | null | undefined;
        }, {
            name: string;
            dosage?: string | null | undefined;
            frequency?: string | null | undefined;
            reason?: string | null | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        medicines: {
            name: string;
            dosage?: string | null | undefined;
            frequency?: string | null | undefined;
            reason?: string | null | undefined;
        }[];
        documentDate?: string | null | undefined;
        pregnancyWeek?: number | null | undefined;
        doctor?: string | null | undefined;
        hospital?: string | null | undefined;
    }, {
        documentDate?: string | null | undefined;
        pregnancyWeek?: number | null | undefined;
        medicines?: {
            name: string;
            dosage?: string | null | undefined;
            frequency?: string | null | undefined;
            reason?: string | null | undefined;
        }[] | undefined;
        doctor?: string | null | undefined;
        hospital?: string | null | undefined;
    }>;
    explanation: z.ZodDefault<z.ZodString>;
    humanSummary: z.ZodDefault<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    timelineEvents: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        eventAt: z.ZodString;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        tags: string[];
        description: string;
        eventAt: string;
    }, {
        title: string;
        description: string;
        eventAt: string;
        tags?: string[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    tags: string[];
    authenticity: {
        score: number;
        reasons: string[];
        redFlags: string[];
    };
    classification: {
        documentType: "PRESCRIPTION" | "LAB_REPORT" | "BILL" | "SCAN" | "MRI" | "ULTRASOUND" | "OTHER";
    };
    extracted: {
        medicines: {
            name: string;
            dosage?: string | null | undefined;
            frequency?: string | null | undefined;
            reason?: string | null | undefined;
        }[];
        documentDate?: string | null | undefined;
        pregnancyWeek?: number | null | undefined;
        doctor?: string | null | undefined;
        hospital?: string | null | undefined;
    };
    explanation: string;
    humanSummary: string;
    timelineEvents: {
        title: string;
        tags: string[];
        description: string;
        eventAt: string;
    }[];
}, {
    authenticity: {
        score: number;
        reasons?: string[] | undefined;
        redFlags?: string[] | undefined;
    };
    classification: {
        documentType: "PRESCRIPTION" | "LAB_REPORT" | "BILL" | "SCAN" | "MRI" | "ULTRASOUND" | "OTHER";
    };
    extracted: {
        documentDate?: string | null | undefined;
        pregnancyWeek?: number | null | undefined;
        medicines?: {
            name: string;
            dosage?: string | null | undefined;
            frequency?: string | null | undefined;
            reason?: string | null | undefined;
        }[] | undefined;
        doctor?: string | null | undefined;
        hospital?: string | null | undefined;
    };
    tags?: string[] | undefined;
    explanation?: string | undefined;
    humanSummary?: string | undefined;
    timelineEvents?: {
        title: string;
        description: string;
        eventAt: string;
        tags?: string[] | undefined;
    }[] | undefined;
}>;
export type LlmMedicalExtraction = z.infer<typeof extractionSchema>;
export declare class OpenRouterClient {
    private readonly configService;
    private readonly apiKey;
    private readonly baseUrl;
    private readonly model;
    constructor(configService: ConfigService);
    analyzeMedicalText(ocrText: string): Promise<LlmMedicalExtraction>;
    answerDocumentQuestion(context: {
        documentType?: string | null;
        summary?: string | null;
        doctorName?: string | null;
        hospitalName?: string | null;
        pregnancyWeek?: number | null;
        reportText?: string | null;
    }, question: string): Promise<string>;
    private parseModelJson;
    private createFallbackExtraction;
    private inferDocumentType;
}
export {};
