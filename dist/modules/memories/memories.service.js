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
exports.MemoriesService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_2 = require("bullmq");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const queues_1 = require("../../common/constants/queues");
const minio_client_1 = require("../../integrations/storage/minio.client");
const pregnancy_profile_entity_1 = require("../pregnancy-profiles/entities/pregnancy-profile.entity");
const user_entity_1 = require("../users/entities/user.entity");
const memory_entity_1 = require("./entities/memory.entity");
let MemoriesService = class MemoriesService {
    constructor(memoryRepository, profileRepository, userRepository, timelineQueue, minioClient) {
        this.memoryRepository = memoryRepository;
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.timelineQueue = timelineQueue;
        this.minioClient = minioClient;
    }
    async createUploadIntent(userId, dto) {
        const [profile, user] = await Promise.all([
            this.profileRepository.findOne({ where: { id: dto.profileId } }),
            this.userRepository.findOne({ where: { id: userId } })
        ]);
        if (!profile || !user) {
            throw new common_1.NotFoundException('Profile or user not found');
        }
        const safeFileName = dto.fileName.replace(/[^\w.\- ]+/g, '_');
        const objectKey = `${dto.profileId}/${new Date().toISOString().slice(0, 10)}/memory-${(0, crypto_1.randomUUID)()}-${safeFileName}`;
        const bucket = this.minioClient.getMediaBucket();
        const uploadUrl = await this.minioClient.getPresignedPutUrl(bucket, objectKey, 900);
        return {
            objectKey,
            bucket,
            uploadUrl,
            mediaType: this.resolveMediaType(dto.mimeType)
        };
    }
    async create(userId, dto) {
        const [profile, user] = await Promise.all([
            this.profileRepository.findOne({ where: { id: dto.profileId } }),
            this.userRepository.findOne({ where: { id: userId } })
        ]);
        if (!profile || !user) {
            throw new common_1.NotFoundException('Profile or user not found');
        }
        const memory = this.memoryRepository.create({
            profile,
            createdBy: user,
            title: dto.title,
            description: dto.description,
            memoryAt: new Date(dto.memoryAt),
            tags: dto.tags ?? [],
            mediaRefs: dto.mediaRefs ?? []
        });
        const saved = await this.memoryRepository.save(memory);
        await this.timelineQueue.add(queues_1.JOB_NAMES.BUILD_TIMELINE_EVENT, {
            sourceType: 'MEMORY',
            sourceId: saved.id,
            profileId: dto.profileId,
            title: saved.title
        }, { removeOnComplete: true, removeOnFail: false, jobId: `${saved.id}-timeline` });
        return saved;
    }
    async find(query) {
        const qb = this.memoryRepository
            .createQueryBuilder('memory')
            .leftJoinAndSelect('memory.createdBy', 'createdBy')
            .where('memory.profileId = :profileId', { profileId: query.profileId });
        if (query.from) {
            qb.andWhere('memory.memoryAt >= :from', { from: query.from });
        }
        if (query.to) {
            qb.andWhere('memory.memoryAt <= :to', { to: query.to });
        }
        qb.orderBy('memory.memoryAt', 'DESC');
        const memories = await qb.getMany();
        return Promise.all(memories.map((memory) => this.attachDownloadUrls(memory)));
    }
    resolveMediaType(mimeType) {
        if (mimeType.startsWith('image/')) {
            return memory_entity_1.MemoryMediaType.PHOTO;
        }
        if (mimeType.startsWith('video/')) {
            return memory_entity_1.MemoryMediaType.VIDEO;
        }
        return memory_entity_1.MemoryMediaType.DOCUMENT;
    }
    async attachDownloadUrls(memory) {
        if (!memory.mediaRefs || memory.mediaRefs.length === 0) {
            return memory;
        }
        const refs = await Promise.all(memory.mediaRefs.map(async (ref) => {
            try {
                const downloadUrl = await this.minioClient.getPresignedGetUrl(ref.bucket, ref.objectKey, 300);
                return { ...ref, downloadUrl };
            }
            catch {
                return ref;
            }
        }));
        memory.mediaRefs = refs;
        return memory;
    }
};
exports.MemoriesService = MemoriesService;
exports.MemoriesService = MemoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(memory_entity_1.Memory)),
    __param(1, (0, typeorm_1.InjectRepository)(pregnancy_profile_entity_1.PregnancyProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, bullmq_1.InjectQueue)(queues_1.QUEUES.TIMELINE_BUILD)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        bullmq_2.Queue,
        minio_client_1.MinioClientService])
], MemoriesService);
//# sourceMappingURL=memories.service.js.map