import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { TimelineEvent, TimelineSourceType } from '@/modules/timeline/entities/timeline-event.entity';
interface TimelineBuildJobData {
    sourceType: keyof typeof TimelineSourceType;
    sourceId: string;
    profileId: string;
    title: string;
    description?: string;
    occurredAt?: string;
    tags?: string[];
}
export declare class TimelineBuildProcessor extends WorkerHost {
    private readonly timelineRepository;
    constructor(timelineRepository: Repository<TimelineEvent>);
    process(job: Job<TimelineBuildJobData>): Promise<void>;
}
export {};
