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
exports.DocumentOcrProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_2 = require("bullmq");
const typeorm_2 = require("typeorm");
const ocr_adapter_1 = require("../../integrations/ocr/ocr.adapter");
const queues_1 = require("../../common/constants/queues");
const medical_document_entity_1 = require("../../modules/medical-documents/entities/medical-document.entity");
let DocumentOcrProcessor = class DocumentOcrProcessor extends bullmq_1.WorkerHost {
    constructor(documentRepository, ocrAdapter, llmQueue) {
        super();
        this.documentRepository = documentRepository;
        this.ocrAdapter = ocrAdapter;
        this.llmQueue = llmQueue;
    }
    async process(job) {
        const { documentId } = job.data;
        const document = await this.documentRepository.findOne({ where: { id: documentId }, relations: ['file'] });
        if (!document) {
            throw new common_1.NotFoundException('Document not found during OCR stage');
        }
        try {
            const objectKey = document.file.normalizedObjectKey ?? document.file.objectKey;
            const ocrResult = await this.ocrAdapter.extractTextFromObject(document.file.bucket, objectKey);
            const ocrText = (ocrResult.text ?? '').trim();
            if (!ocrText) {
                throw new Error('OCR returned empty text');
            }
            document.ocrText = ocrText;
            document.pipelineStatus = medical_document_entity_1.MedicalPipelineStatus.OCR_DONE;
            document.structuredJson = {
                ...(document.structuredJson ?? {}),
                ocrMeta: {
                    provider: ocrResult.provider,
                    confidence: ocrResult.confidence,
                    pages: ocrResult.pages,
                    comparison: ocrResult.comparison ?? null
                }
            };
            await this.documentRepository.save(document);
            await this.llmQueue.add(queues_1.JOB_NAMES.RUN_LLM_EXTRACTION, { documentId }, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 4000 },
                removeOnComplete: true,
                removeOnFail: false,
                jobId: `${documentId}-llm`
            });
        }
        catch (error) {
            document.pipelineStatus = medical_document_entity_1.MedicalPipelineStatus.FAILED;
            document.structuredJson = {
                ...(document.structuredJson ?? {}),
                ocrError: {
                    at: new Date().toISOString(),
                    message: error instanceof Error ? error.message : 'Unknown OCR error'
                }
            };
            await this.documentRepository.save(document);
            throw error;
        }
    }
};
exports.DocumentOcrProcessor = DocumentOcrProcessor;
exports.DocumentOcrProcessor = DocumentOcrProcessor = __decorate([
    (0, common_1.Injectable)(),
    (0, bullmq_1.Processor)(queues_1.QUEUES.DOCUMENT_OCR),
    __param(0, (0, typeorm_1.InjectRepository)(medical_document_entity_1.MedicalDocument)),
    __param(2, (0, bullmq_1.InjectQueue)(queues_1.QUEUES.DOCUMENT_LLM)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ocr_adapter_1.OcrAdapter,
        bullmq_2.Queue])
], DocumentOcrProcessor);
//# sourceMappingURL=document-ocr.processor.js.map