import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { MinioClientService } from '@/integrations/storage/minio.client';
import { ClamavAdapter } from '@/integrations/antivirus/clamav.adapter';
import { FileObject } from './entities/file-object.entity';
import { CreateUploadIntentDto, CompleteUploadDto } from './dto/upload-file.dto';
import { User } from '@/modules/users/entities/user.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { MedicalDocument, MedicalPipelineStatus } from '@/modules/medical-documents/entities/medical-document.entity';
export declare class FilesService {
    private readonly fileRepository;
    private readonly profileRepository;
    private readonly userRepository;
    private readonly documentRepository;
    private readonly normalizeQueue;
    private readonly minioClient;
    private readonly clamavAdapter;
    constructor(fileRepository: Repository<FileObject>, profileRepository: Repository<PregnancyProfile>, userRepository: Repository<User>, documentRepository: Repository<MedicalDocument>, normalizeQueue: Queue, minioClient: MinioClientService, clamavAdapter: ClamavAdapter);
    createUploadIntent(userId: string, dto: CreateUploadIntentDto): Promise<{
        fileId: string;
        objectKey: string;
        uploadUrl: string;
    }>;
    completeUpload(fileId: string, userId: string, dto: CompleteUploadDto): Promise<{
        documentId: string;
        pipelineStatus: MedicalPipelineStatus;
    }>;
    getDownloadUrl(fileId: string, userId: string): Promise<{
        downloadUrl: string;
    }>;
}
