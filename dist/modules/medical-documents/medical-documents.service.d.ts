import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { FileObject } from '@/modules/files/entities/file-object.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { User } from '@/modules/users/entities/user.entity';
import { CreateMedicalDocumentDto, QueryMedicalDocumentsDto } from './dto/medical-document.dto';
import { MedicalDocument } from './entities/medical-document.entity';
import { MinioClientService } from '@/integrations/storage/minio.client';
import { OpenRouterClient } from '@/integrations/llm/openrouter.client';
export declare class MedicalDocumentsService {
    private readonly medicalDocumentRepository;
    private readonly fileRepository;
    private readonly profileRepository;
    private readonly userRepository;
    private readonly normalizeQueue;
    private readonly minioClient;
    private readonly openRouterClient;
    constructor(medicalDocumentRepository: Repository<MedicalDocument>, fileRepository: Repository<FileObject>, profileRepository: Repository<PregnancyProfile>, userRepository: Repository<User>, normalizeQueue: Queue, minioClient: MinioClientService, openRouterClient: OpenRouterClient);
    create(userId: string, dto: CreateMedicalDocumentDto): Promise<MedicalDocument>;
    findAll(query: QueryMedicalDocumentsDto): Promise<MedicalDocument[]>;
    findById(profileId: string, id: string): Promise<MedicalDocument>;
    getOcrText(profileId: string, id: string): Promise<{
        ocrText: string | null;
    }>;
    getSummary(profileId: string, id: string): Promise<{
        summary: string | null;
    }>;
    askQuestion(profileId: string, id: string, question: string): Promise<{
        answer: string;
    }>;
    reprocess(profileId: string, id: string): Promise<{
        status: string;
    }>;
    remove(profileId: string, id: string): Promise<{
        status: string;
    }>;
}
