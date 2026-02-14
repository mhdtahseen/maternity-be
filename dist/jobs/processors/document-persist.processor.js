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
exports.DocumentPersistProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_2 = require("bullmq");
const typeorm_2 = require("typeorm");
const queues_1 = require("../../common/constants/queues");
const medical_document_entity_1 = require("../../modules/medical-documents/entities/medical-document.entity");
const medicine_entity_1 = require("../../modules/medical-documents/entities/medicine.entity");
const medical_event_entity_1 = require("../../modules/medical-documents/entities/medical-event.entity");
let DocumentPersistProcessor = class DocumentPersistProcessor extends bullmq_1.WorkerHost {
    constructor(documentRepository, medicineRepository, medicalEventRepository, timelineQueue, searchQueue) {
        super();
        this.documentRepository = documentRepository;
        this.medicineRepository = medicineRepository;
        this.medicalEventRepository = medicalEventRepository;
        this.timelineQueue = timelineQueue;
        this.searchQueue = searchQueue;
    }
    async process(job) {
        const { documentId, extraction } = job.data;
        const document = await this.documentRepository.findOne({
            where: { id: documentId },
            relations: ['profile', 'medicines']
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found during persist stage');
        }
        const pregnancyWeek = extraction.extracted.pregnancyWeek;
        const normalizedPregnancyWeek = typeof pregnancyWeek === 'number' && Number.isFinite(pregnancyWeek)
            ? Math.max(1, Math.min(45, Math.floor(pregnancyWeek)))
            : null;
        document.documentType = medical_document_entity_1.MedicalDocumentType[extraction.classification.documentType] ?? medical_document_entity_1.MedicalDocumentType.OTHER;
        document.authenticityScore = extraction.authenticity.score;
        document.authenticityFlagged = extraction.authenticity.redFlags.length > 0;
        document.doctorName = extraction.extracted.doctor ?? null;
        document.hospitalName = extraction.extracted.hospital ?? null;
        document.documentDate = extraction.extracted.documentDate ?? null;
        document.pregnancyWeek = normalizedPregnancyWeek;
        document.summary = extraction.humanSummary;
        document.tags = this.buildDocumentTags(document.documentType, document.ocrText, extraction.tags);
        document.structuredJson = {
            ...(document.structuredJson ?? {}),
            extraction
        };
        document.pipelineStatus = document.authenticityFlagged
            ? medical_document_entity_1.MedicalPipelineStatus.REVIEW_REQUIRED
            : medical_document_entity_1.MedicalPipelineStatus.LLM_DONE;
        await this.documentRepository.save(document);
        if (document.medicines.length > 0) {
            await this.medicineRepository.delete({ document: { id: document.id } });
        }
        if (extraction.extracted.medicines.length > 0) {
            const medicines = extraction.extracted.medicines.map((item) => this.medicineRepository.create({
                document,
                name: item.name,
                dosage: item.dosage,
                frequency: item.frequency,
                reason: item.reason
            }));
            await this.medicineRepository.save(medicines);
        }
        if (extraction.timelineEvents.length > 0) {
            const events = extraction.timelineEvents.map((event) => this.medicalEventRepository.create({
                profile: document.profile,
                sourceDocument: document,
                title: event.title,
                description: event.description,
                eventAt: new Date(event.eventAt),
                tags: event.tags
            }));
            await this.medicalEventRepository.save(events);
        }
        await this.timelineQueue.add(queues_1.JOB_NAMES.BUILD_TIMELINE_EVENT, {
            sourceType: 'MEDICAL_DOCUMENT',
            sourceId: document.id,
            profileId: document.profile.id,
            title: `Medical document analyzed: ${document.documentType}`,
            description: extraction.humanSummary,
            occurredAt: extraction.extracted.documentDate ?? new Date().toISOString(),
            tags: document.tags
        }, { removeOnComplete: true, removeOnFail: false, jobId: `${document.id}-timeline-medical` });
        await this.searchQueue.add(queues_1.JOB_NAMES.INDEX_SEARCH, {
            entityType: 'MEDICAL_DOCUMENT',
            entityId: document.id,
            profileId: document.profile.id
        }, {
            removeOnComplete: true,
            removeOnFail: false,
            jobId: `${document.id}-search`
        });
    }
    buildDocumentTags(documentType, ocrText, llmTags) {
        const primary = documentType;
        const subtype = this.inferSubtypeTag(documentType, `${ocrText ?? ''} ${(llmTags ?? []).join(' ')}`);
        return subtype ? [primary, subtype] : [primary];
    }
    inferSubtypeTag(documentType, source) {
        const text = source.toLowerCase();
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
exports.DocumentPersistProcessor = DocumentPersistProcessor;
exports.DocumentPersistProcessor = DocumentPersistProcessor = __decorate([
    (0, common_1.Injectable)(),
    (0, bullmq_1.Processor)(queues_1.QUEUES.DOCUMENT_PERSIST),
    __param(0, (0, typeorm_1.InjectRepository)(medical_document_entity_1.MedicalDocument)),
    __param(1, (0, typeorm_1.InjectRepository)(medicine_entity_1.Medicine)),
    __param(2, (0, typeorm_1.InjectRepository)(medical_event_entity_1.MedicalEvent)),
    __param(3, (0, bullmq_1.InjectQueue)(queues_1.QUEUES.TIMELINE_BUILD)),
    __param(4, (0, bullmq_1.InjectQueue)(queues_1.QUEUES.SEARCH_INDEX)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        bullmq_2.Queue,
        bullmq_2.Queue])
], DocumentPersistProcessor);
//# sourceMappingURL=document-persist.processor.js.map