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
exports.MedicalDocumentsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_2 = require("bullmq");
const typeorm_2 = require("typeorm");
const queues_1 = require("../../common/constants/queues");
const file_object_entity_1 = require("../files/entities/file-object.entity");
const pregnancy_profile_entity_1 = require("../pregnancy-profiles/entities/pregnancy-profile.entity");
const user_entity_1 = require("../users/entities/user.entity");
const medical_document_entity_1 = require("./entities/medical-document.entity");
const minio_client_1 = require("../../integrations/storage/minio.client");
const openrouter_client_1 = require("../../integrations/llm/openrouter.client");
let MedicalDocumentsService = class MedicalDocumentsService {
    constructor(medicalDocumentRepository, fileRepository, profileRepository, userRepository, normalizeQueue, minioClient, openRouterClient) {
        this.medicalDocumentRepository = medicalDocumentRepository;
        this.fileRepository = fileRepository;
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.normalizeQueue = normalizeQueue;
        this.minioClient = minioClient;
        this.openRouterClient = openRouterClient;
    }
    async create(userId, dto) {
        const [profile, file, user] = await Promise.all([
            this.profileRepository.findOne({ where: { id: dto.profileId } }),
            this.fileRepository.findOne({ where: { id: dto.fileId } }),
            this.userRepository.findOne({ where: { id: userId } })
        ]);
        if (!profile || !file || !user) {
            throw new common_1.NotFoundException('Profile, file, or user not found');
        }
        const document = this.medicalDocumentRepository.create({
            profile,
            file,
            createdBy: user,
            pipelineStatus: medical_document_entity_1.MedicalPipelineStatus.RECEIVED
        });
        const saved = await this.medicalDocumentRepository.save(document);
        await this.normalizeQueue.add(queues_1.JOB_NAMES.NORMALIZE_DOCUMENT, { documentId: saved.id, fileId: file.id, profileId: profile.id }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 3000 },
            removeOnComplete: true,
            removeOnFail: false,
            jobId: `${saved.id}-normalize`
        });
        return saved;
    }
    async findAll(query) {
        const qb = this.medicalDocumentRepository
            .createQueryBuilder('doc')
            .leftJoinAndSelect('doc.file', 'file')
            .leftJoinAndSelect('doc.createdBy', 'createdBy')
            .where('doc.profileId = :profileId', { profileId: query.profileId });
        if (query.type) {
            qb.andWhere('doc.documentType = :type', { type: query.type });
        }
        if (query.tag) {
            qb.andWhere(':tag = ANY(doc.tags)', { tag: query.tag });
        }
        if (query.from) {
            qb.andWhere('doc.documentDate >= :from', { from: query.from });
        }
        if (query.to) {
            qb.andWhere('doc.documentDate <= :to', { to: query.to });
        }
        if (query.q) {
            qb.andWhere('(doc.summary ILIKE :q OR doc.ocrText ILIKE :q OR doc.hospitalName ILIKE :q OR doc.doctorName ILIKE :q)', {
                q: `%${query.q}%`
            });
        }
        qb.orderBy('doc.documentDate', 'DESC', 'NULLS LAST').addOrderBy('doc.createdAt', 'DESC');
        return qb.getMany();
    }
    async findById(profileId, id) {
        const document = await this.medicalDocumentRepository.findOne({
            where: { id, profile: { id: profileId } },
            relations: ['medicines', 'file', 'createdBy']
        });
        if (!document) {
            throw new common_1.NotFoundException('Medical document not found');
        }
        return document;
    }
    async getOcrText(profileId, id) {
        const document = await this.findById(profileId, id);
        return { ocrText: document.ocrText ?? null };
    }
    async getSummary(profileId, id) {
        const document = await this.findById(profileId, id);
        return { summary: document.summary ?? null };
    }
    async askQuestion(profileId, id, question) {
        const document = await this.findById(profileId, id);
        const context = {
            documentType: document.documentType ?? null,
            summary: document.summary ?? null,
            doctorName: document.doctorName ?? null,
            hospitalName: document.hospitalName ?? null,
            pregnancyWeek: document.pregnancyWeek ?? null,
            reportText: (document.ocrText ?? '').slice(0, 18000)
        };
        const answer = await this.openRouterClient.answerDocumentQuestion(context, question);
        return { answer };
    }
    async reprocess(profileId, id) {
        const document = await this.findById(profileId, id);
        document.pipelineStatus = medical_document_entity_1.MedicalPipelineStatus.RECEIVED;
        await this.medicalDocumentRepository.save(document);
        await this.normalizeQueue.add(queues_1.JOB_NAMES.NORMALIZE_DOCUMENT, { documentId: document.id, fileId: document.file.id, profileId }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 3000 },
            removeOnComplete: true,
            removeOnFail: false,
            jobId: `${document.id}-normalize-reprocess-${Date.now()}`
        });
        return { status: 'queued' };
    }
    async remove(profileId, id) {
        const document = await this.medicalDocumentRepository.findOne({
            where: { id, profile: { id: profileId } },
            relations: ['file']
        });
        if (!document) {
            throw new common_1.NotFoundException('Medical document not found');
        }
        const fileId = document.file?.id;
        const bucket = document.file?.bucket;
        const objectKey = document.file?.normalizedObjectKey ?? document.file?.objectKey;
        await this.medicalDocumentRepository.remove(document);
        if (!fileId || !bucket || !objectKey) {
            return { status: 'deleted' };
        }
        const linkedCount = await this.medicalDocumentRepository.count({ where: { file: { id: fileId } } });
        if (linkedCount === 0) {
            const fileRecord = await this.fileRepository.findOne({ where: { id: fileId } });
            if (fileRecord) {
                await this.fileRepository.remove(fileRecord);
            }
            try {
                await this.minioClient.removeObject(bucket, objectKey);
            }
            catch {
            }
        }
        return { status: 'deleted' };
    }
};
exports.MedicalDocumentsService = MedicalDocumentsService;
exports.MedicalDocumentsService = MedicalDocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(medical_document_entity_1.MedicalDocument)),
    __param(1, (0, typeorm_1.InjectRepository)(file_object_entity_1.FileObject)),
    __param(2, (0, typeorm_1.InjectRepository)(pregnancy_profile_entity_1.PregnancyProfile)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, bullmq_1.InjectQueue)(queues_1.QUEUES.DOCUMENT_NORMALIZE)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        bullmq_2.Queue,
        minio_client_1.MinioClientService,
        openrouter_client_1.OpenRouterClient])
], MedicalDocumentsService);
//# sourceMappingURL=medical-documents.service.js.map