import { WorkerHost } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { Repository } from 'typeorm';
import { FileObject } from '@/modules/files/entities/file-object.entity';
import { MedicalDocument } from '@/modules/medical-documents/entities/medical-document.entity';
interface NormalizeDocumentJobData {
    documentId: string;
    fileId: string;
    profileId: string;
}
export declare class DocumentNormalizeProcessor extends WorkerHost {
    private readonly fileRepository;
    private readonly documentRepository;
    private readonly ocrQueue;
    constructor(fileRepository: Repository<FileObject>, documentRepository: Repository<MedicalDocument>, ocrQueue: Queue);
    process(job: Job<NormalizeDocumentJobData>): Promise<void>;
}
export {};
