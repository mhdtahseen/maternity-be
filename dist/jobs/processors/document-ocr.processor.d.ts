import { WorkerHost } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { Repository } from 'typeorm';
import { OcrAdapter } from '@/integrations/ocr/ocr.adapter';
import { MedicalDocument } from '@/modules/medical-documents/entities/medical-document.entity';
interface OcrJobData {
    documentId: string;
}
export declare class DocumentOcrProcessor extends WorkerHost {
    private readonly documentRepository;
    private readonly ocrAdapter;
    private readonly llmQueue;
    constructor(documentRepository: Repository<MedicalDocument>, ocrAdapter: OcrAdapter, llmQueue: Queue);
    process(job: Job<OcrJobData>): Promise<void>;
}
export {};
