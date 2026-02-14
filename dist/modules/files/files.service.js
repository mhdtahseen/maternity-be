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
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_2 = require("bullmq");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const minio_client_1 = require("../../integrations/storage/minio.client");
const clamav_adapter_1 = require("../../integrations/antivirus/clamav.adapter");
const file_object_entity_1 = require("./entities/file-object.entity");
const user_entity_1 = require("../users/entities/user.entity");
const pregnancy_profile_entity_1 = require("../pregnancy-profiles/entities/pregnancy-profile.entity");
const medical_document_entity_1 = require("../medical-documents/entities/medical-document.entity");
const queues_1 = require("../../common/constants/queues");
let FilesService = class FilesService {
    constructor(fileRepository, profileRepository, userRepository, documentRepository, normalizeQueue, minioClient, clamavAdapter) {
        this.fileRepository = fileRepository;
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
        this.normalizeQueue = normalizeQueue;
        this.minioClient = minioClient;
        this.clamavAdapter = clamavAdapter;
    }
    async createUploadIntent(userId, dto) {
        const [profile, user] = await Promise.all([
            this.profileRepository.findOne({ where: { id: dto.profileId } }),
            this.userRepository.findOne({ where: { id: userId } })
        ]);
        if (!profile || !user) {
            throw new common_1.NotFoundException('Profile or user not found');
        }
        const objectKey = `${dto.profileId}/${new Date().toISOString().slice(0, 10)}/${(0, crypto_1.randomUUID)()}-${dto.fileName}`;
        const bucket = this.minioClient.getMedicalBucket();
        const uploadUrl = await this.minioClient.getPresignedPutUrl(bucket, objectKey, 600);
        const file = this.fileRepository.create({
            profile,
            uploadedBy: user,
            bucket,
            objectKey,
            originalName: dto.fileName,
            mimeType: dto.mimeType,
            sizeBytes: dto.sizeBytes,
            checksumSha256: dto.checksumSha256,
            status: file_object_entity_1.FileObjectStatus.UPLOADED
        });
        const saved = await this.fileRepository.save(file);
        return {
            fileId: saved.id,
            objectKey,
            uploadUrl
        };
    }
    async completeUpload(fileId, userId, dto) {
        const file = await this.fileRepository.findOne({ where: { id: fileId }, relations: ['profile', 'uploadedBy'] });
        if (!file || file.profile.id !== dto.profileId) {
            throw new common_1.NotFoundException('File not found for profile');
        }
        if (file.uploadedBy.id !== userId) {
            throw new common_1.BadRequestException('Only uploader can finalize upload');
        }
        const scanResult = await this.clamavAdapter.scanObject(file.bucket, file.objectKey);
        if (!scanResult.clean) {
            file.status = file_object_entity_1.FileObjectStatus.FAILED;
            await this.fileRepository.save(file);
            throw new common_1.BadRequestException(`Malware detected: ${scanResult.signature ?? 'unknown signature'}`);
        }
        if (dto.originalName) {
            file.originalName = dto.originalName;
        }
        await this.fileRepository.save(file);
        const document = this.documentRepository.create({
            profile: file.profile,
            file,
            createdBy: file.uploadedBy,
            pipelineStatus: medical_document_entity_1.MedicalPipelineStatus.RECEIVED
        });
        const savedDocument = await this.documentRepository.save(document);
        await this.normalizeQueue.add(queues_1.JOB_NAMES.NORMALIZE_DOCUMENT, { documentId: savedDocument.id, fileId: file.id, profileId: file.profile.id }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 3000 },
            removeOnComplete: true,
            removeOnFail: false,
            jobId: `${savedDocument.id}-normalize`
        });
        return { documentId: savedDocument.id, pipelineStatus: savedDocument.pipelineStatus };
    }
    async getDownloadUrl(fileId, userId) {
        const file = await this.fileRepository.findOne({ where: { id: fileId }, relations: ['uploadedBy'] });
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        if (file.uploadedBy.id !== userId) {
            throw new common_1.BadRequestException('No access to this file');
        }
        const downloadUrl = await this.minioClient.getPresignedGetUrl(file.bucket, file.objectKey, 120);
        return { downloadUrl };
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_object_entity_1.FileObject)),
    __param(1, (0, typeorm_1.InjectRepository)(pregnancy_profile_entity_1.PregnancyProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(medical_document_entity_1.MedicalDocument)),
    __param(4, (0, bullmq_1.InjectQueue)(queues_1.QUEUES.DOCUMENT_NORMALIZE)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        bullmq_2.Queue,
        minio_client_1.MinioClientService,
        clamav_adapter_1.ClamavAdapter])
], FilesService);
//# sourceMappingURL=files.service.js.map