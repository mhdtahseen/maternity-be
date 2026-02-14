import { Repository } from 'typeorm';
import { QueryTimelineDto } from './dto/query-timeline.dto';
import { TimelineEvent } from './entities/timeline-event.entity';
export declare class TimelineService {
    private readonly timelineRepository;
    constructor(timelineRepository: Repository<TimelineEvent>);
    find(query: QueryTimelineDto): Promise<TimelineEvent[]>;
    create(payload: Partial<TimelineEvent>): Promise<TimelineEvent>;
}
