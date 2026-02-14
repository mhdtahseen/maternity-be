import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '@/common/constants/queues';

interface SearchIndexJobData {
  entityType: 'MEDICAL_DOCUMENT' | 'DAILY_JOURNAL' | 'MEMORY' | 'TIMELINE';
  entityId: string;
  profileId: string;
}

@Injectable()
@Processor(QUEUES.SEARCH_INDEX)
export class SearchIndexProcessor extends WorkerHost {
  async process(job: Job<SearchIndexJobData>): Promise<void> {
    // Placeholder for OpenSearch/PG tsvector sync.
    console.log('Search index job processed', job.data);
  }
}
