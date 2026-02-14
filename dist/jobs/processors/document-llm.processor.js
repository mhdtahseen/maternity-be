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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentLlmProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_2 = require("bullmq");
const typeorm_2 = require("typeorm");
const openrouter_client_1 = require("../../integrations/llm/openrouter.client");
const queues_1 = require("../../common/constants/queues");
const medical_document_entity_1 = require("../../modules/medical-documents/entities/medical-document.entity");
let DocumentLlmProcessor = class DocumentLlmProcessor extends bullmq_1.WorkerHost {
    constructor(documentRepository, openRouterClient, persistQueue) {
        super();
        this.documentRepository = documentRepository;
        this.openRouterClient = openRouterClient;
        this.persistQueue = persistQueue;
    }
    async process(job) {
        const { documentId } = job.data;
        const document = await this.documentRepository.findOne({ where: { id: documentId }, relations: ['file'] });
        if (!document || !document.ocrText) {
            throw new common_1.NotFoundException('Document or OCR text missing for LLM stage');
        }
        try {
            const extraction = await this.openRouterClient.analyzeMedicalText(document.ocrText);
            await this.persistQueue.add(queues_1.JOB_NAMES.PERSIST_MEDICAL_ANALYSIS, { documentId, extraction }, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 4000 },
                removeOnComplete: true,
                removeOnFail: false,
                jobId: `${documentId}-persist`
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown LLM stage failure';
            const combinedText = `${document.file?.originalName ?? ''} ${document.ocrText}`;
            document.documentType = document.documentType ?? this.inferDocumentType(combinedText);
            document.summary =
                document.summary ??
                    `AI extraction failed. Basic OCR captured and marked for review. (${errorMessage.slice(0, 120)})`;
            document.tags = this.buildFallbackTags(document.documentType, combinedText);
            document.pipelineStatus = medical_document_entity_1.MedicalPipelineStatus.REVIEW_REQUIRED;
            document.structuredJson = {
                ...(document.structuredJson ?? {}),
                llmError: {
                    at: new Date().toISOString(),
                    message: errorMessage
                }
            };
            await this.documentRepository.save(document);
        }
    }
    inferDocumentType(text) {
        const normalized = text.toLowerCase();
        if (/ultrasound|sonography|anomaly\s*scan|nt\s*scan/.test(normalized)) {
            return medical_document_entity_1.MedicalDocumentType.ULTRASOUND;
        }
        if (/\bmri\b|magnetic resonance/.test(normalized)) {
            return medical_document_entity_1.MedicalDocumentType.MRI;
        }
        if (/\bscan\b|ct\b|x[- ]?ray/.test(normalized)) {
            return medical_document_entity_1.MedicalDocumentType.SCAN;
        }
        if (/prescription|\brx\b|dosage|tablet|capsule/.test(normalized)) {
            return medical_document_entity_1.MedicalDocumentType.PRESCRIPTION;
        }
        if (/lab|blood|cbc|hemoglobin|test report/.test(normalized)) {
            return medical_document_entity_1.MedicalDocumentType.LAB_REPORT;
        }
        if (/invoice|bill|amount due|payment/.test(normalized)) {
            return medical_document_entity_1.MedicalDocumentType.BILL;
        }
        return medical_document_entity_1.MedicalDocumentType.OTHER;
    }
    buildFallbackTags(documentType, sourceText) {
        const subtype = this.inferSubtypeTag(documentType, sourceText);
        return subtype ? [documentType, subtype] : [documentType];
    }
    inferSubtypeTag(documentType, sourceText) {
        const text = sourceText.toLowerCase();
        const patterns = documentType === medical_document_entity_1.MedicalDocumentType.ULTRASOUND
            ? [
                { regex: /\bnt\b|nuchal translucency/, label: 'NT Scan' },
                { regex: /\banomaly\b/, label: 'Anomaly Scan' },
                { regex: /\bmorphology\b|\blevel\s*ii\b|\btiffa\b/, label: 'Morphology Scan' },
                { regex: /\bgrowth\b/, label: 'Growth Scan' },
                { regex: /\bdating\b/, label: 'Dating Scan' },
                { regex: /\bviability\b/, label: 'Viability Scan' }
            ]
            : documentType === medical_document_entity_1.MedicalDocumentType.LAB_REPORT
                ? [
                    { regex: /\bcbc\b|complete blood count/, label: 'CBC' },
                    { regex: /\bthyroid\b|\btsh\b|\bt3\b|\bt4\b/, label: 'Thyroid Profile' },
                    { regex: /\bglucose\b|\bogtt\b|oral glucose tolerance/, label: 'Glucose Test' },
                    { regex: /\burine\b/, label: 'Urine Test' }
                ]
                : documentType === medical_document_entity_1.MedicalDocumentType.SCAN
                    ? [
                        { regex: /\bct\b/, label: 'CT Scan' },
                        { regex: /\bx[- ]?ray\b/, label: 'X-Ray' }
                    ]
                    : documentType === medical_document_entity_1.MedicalDocumentType.MRI
                        ? [{ regex: /\bmri\b|magnetic resonance/, label: 'MRI' }]
                        : [];
        for (const pattern of patterns) {
            if (pattern.regex.test(text)) {
                return pattern.label;
            }
        }
        return null;
    }
};
exports.DocumentLlmProcessor = DocumentLlmProcessor;
exports.DocumentLlmProcessor = DocumentLlmProcessor = __decorate([
    (0, common_1.Injectable)(),
    (0, bullmq_1.Processor)(queues_1.QUEUES.DOCUMENT_LLM),
    __param(0, (0, typeorm_1.InjectRepository)(medical_document_entity_1.MedicalDocument)),
    __param(2, (0, bullmq_1.InjectQueue)(queues_1.QUEUES.DOCUMENT_PERSIST)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        openrouter_client_1.OpenRouterClient,
        bullmq_2.Queue])
], DocumentLlmProcessor);
//# sourceMappingURL=document-llm.processor.js.map