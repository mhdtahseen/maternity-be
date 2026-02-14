import { TimelineSourceType } from '../entities/timeline-event.entity';
export declare class QueryTimelineDto {
    profileId: string;
    from?: string;
    to?: string;
    sourceType?: TimelineSourceType;
}
