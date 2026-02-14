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
exports.DocumentNormalizeProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_2 = require("bullmq");
const typeorm_2 = require("typeorm");
const queues_1 = require("../../common/constants/queues");
const file_object_entity_1 = require("../../modules/files/entities/file-object.entity");
const medical_document_entity_1 = require("../../modules/medical-documents/entities/medical-document.entity");
let DocumentNormalizeProcessor = class DocumentNormalizeProcessor extends bullmq_1.WorkerHost {
    constructor(fileRepository, documentRepository, ocrQueue) {
        super();
        this.fileRepository = fileRepository;
        this.documentRepository = documentRepository;
        this.ocrQueue = ocrQueue;
    }
    async process(job) {
        const { documentId, fileId } = job.data;
        const [file, document] = await Promise.all([
            this.fileRepository.findOne({ where: { id: fileId } }),
            this.documentRepository.findOne({ where: { id: documentId }, relations: ['file'] })
        ]);
        if (!file || !document) {
            throw new common_1.NotFoundException('Document normalization payload is invalid');
        }
        file.status = file_object_entity_1.FileObjectStatus.NORMALIZED;
        file.normalizedObjectKey = file.normalizedObjectKey ?? file.objectKey;
        await this.fileRepository.save(file);
        await this.ocrQueue.add(queues_1.JOB_NAMES.EXTRACT_OCR, { documentId }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 3000 },
            removeOnComplete: true,
            removeOnFail: false,
            jobId: `${documentId}-ocr`
        });
    }
};
exports.DocumentNormalizeProcessor = DocumentNormalizeProcessor;
exports.DocumentNormalizeProcessor = DocumentNormalizeProcessor = __decorate([
    (0, common_1.Injectable)(),
    (0, bullmq_1.Processor)(queues_1.QUEUES.DOCUMENT_NORMALIZE),
    __param(0, (0, typeorm_1.InjectRepository)(file_object_entity_1.FileObject)),
    __param(1, (0, typeorm_1.InjectRepository)(medical_document_entity_1.MedicalDocument)),
    __param(2, (0, bullmq_1.InjectQueue)(queues_1.QUEUES.DOCUMENT_OCR)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        bullmq_2.Queue])
], DocumentNormalizeProcessor);
//# sourceMappingURL=document-normalize.processor.js.map