import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
interface SearchIndexJobData {
    entityType: 'MEDICAL_DOCUMENT' | 'DAILY_JOURNAL' | 'MEMORY' | 'TIMELINE';
    entityId: string;
    profileId: string;
}
export declare class SearchIndexProcessor extends WorkerHost {
    process(job: Job<SearchIndexJobData>): Promise<void>;
}
export {};
