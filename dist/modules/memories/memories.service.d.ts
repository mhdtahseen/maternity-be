import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { MinioClientService } from '@/integrations/storage/minio.client';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { User } from '@/modules/users/entities/user.entity';
import { CreateMemoryDto, CreateMemoryUploadIntentDto, QueryMemoriesDto } from './dto/memory.dto';
import { Memory, MemoryMediaType } from './entities/memory.entity';
export declare class MemoriesService {
    private readonly memoryRepository;
    private readonly profileRepository;
    private readonly userRepository;
    private readonly timelineQueue;
    private readonly minioClient;
    constructor(memoryRepository: Repository<Memory>, profileRepository: Repository<PregnancyProfile>, userRepository: Repository<User>, timelineQueue: Queue, minioClient: MinioClientService);
    createUploadIntent(userId: string, dto: CreateMemoryUploadIntentDto): Promise<{
        objectKey: string;
        bucket: string;
        uploadUrl: string;
        mediaType: MemoryMediaType;
    }>;
    create(userId: string, dto: CreateMemoryDto): Promise<Memory>;
    find(query: QueryMemoriesDto): Promise<Memory[]>;
    private resolveMediaType;
    private attachDownloadUrls;
}
