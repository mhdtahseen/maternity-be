import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { JOB_NAMES, QUEUES } from '@/common/constants/queues';
import { MinioClientService } from '@/integrations/storage/minio.client';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { User } from '@/modules/users/entities/user.entity';
import { CreateMemoryDto, CreateMemoryUploadIntentDto, QueryMemoriesDto } from './dto/memory.dto';
import { Memory, MemoryMediaRef, MemoryMediaType } from './entities/memory.entity';

@Injectable()
export class MemoriesService {
  constructor(
    @InjectRepository(Memory)
    private readonly memoryRepository: Repository<Memory>,
    @InjectRepository(PregnancyProfile)
    private readonly profileRepository: Repository<PregnancyProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectQueue(QUEUES.TIMELINE_BUILD)
    private readonly timelineQueue: Queue,
    private readonly minioClient: MinioClientService
  ) {}

  async createUploadIntent(
    userId: string,
    dto: CreateMemoryUploadIntentDto
  ): Promise<{ objectKey: string; bucket: string; uploadUrl: string; mediaType: MemoryMediaType }> {
    const [profile, user] = await Promise.all([
      this.profileRepository.findOne({ where: { id: dto.profileId } }),
      this.userRepository.findOne({ where: { id: userId } })
    ]);

    if (!profile || !user) {
      throw new NotFoundException('Profile or user not found');
    }

    const safeFileName = dto.fileName.replace(/[^\w.\- ]+/g, '_');
    const objectKey = `${dto.profileId}/${new Date().toISOString().slice(0, 10)}/memory-${randomUUID()}-${safeFileName}`;
    const bucket = this.minioClient.getMediaBucket();
    const uploadUrl = await this.minioClient.getPresignedPutUrl(bucket, objectKey, 900);

    return {
      objectKey,
      bucket,
      uploadUrl,
      mediaType: this.resolveMediaType(dto.mimeType)
    };
  }

  async create(userId: string, dto: CreateMemoryDto): Promise<Memory> {
    const [profile, user] = await Promise.all([
      this.profileRepository.findOne({ where: { id: dto.profileId } }),
      this.userRepository.findOne({ where: { id: userId } })
    ]);

    if (!profile || !user) {
      throw new NotFoundException('Profile or user not found');
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

    await this.timelineQueue.add(
      JOB_NAMES.BUILD_TIMELINE_EVENT,
      {
        sourceType: 'MEMORY',
        sourceId: saved.id,
        profileId: dto.profileId,
        title: saved.title
      },
      { removeOnComplete: true, removeOnFail: false, jobId: `${saved.id}-timeline` }
    );

    return saved;
  }

  async find(query: QueryMemoriesDto): Promise<Memory[]> {
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

  private resolveMediaType(mimeType: string): MemoryMediaType {
    if (mimeType.startsWith('image/')) {
      return MemoryMediaType.PHOTO;
    }
    if (mimeType.startsWith('video/')) {
      return MemoryMediaType.VIDEO;
    }
    return MemoryMediaType.DOCUMENT;
  }

  private async attachDownloadUrls(memory: Memory): Promise<Memory> {
    if (!memory.mediaRefs || memory.mediaRefs.length === 0) {
      return memory;
    }

    const refs: MemoryMediaRef[] = await Promise.all(
      memory.mediaRefs.map(async (ref) => {
        try {
          const downloadUrl = await this.minioClient.getPresignedGetUrl(ref.bucket, ref.objectKey, 300);
          return { ...ref, downloadUrl };
        } catch {
          return ref;
        }
      })
    );

    memory.mediaRefs = refs;
    return memory;
  }
}
