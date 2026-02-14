import { WorkerHost } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { Repository } from 'typeorm';
import { OpenRouterClient } from '@/integrations/llm/openrouter.client';
import { MedicalDocument } from '@/modules/medical-documents/entities/medical-document.entity';
interface LlmJobData {
    documentId: string;
}
export declare class DocumentLlmProcessor extends WorkerHost {
    private readonly documentRepository;
    private readonly openRouterClient;
    private readonly persistQueue;
    constructor(documentRepository: Repository<MedicalDocument>, openRouterClient: OpenRouterClient, persistQueue: Queue);
    process(job: Job<LlmJobData>): Promise<void>;
    private inferDocumentType;
    private buildFallbackTags;
    private inferSubtypeTag;
}
export {};
