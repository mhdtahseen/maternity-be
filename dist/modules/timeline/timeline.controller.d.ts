import { QueryTimelineDto } from './dto/query-timeline.dto';
import { TimelineService } from './timeline.service';
export declare class TimelineController {
    private readonly timelineService;
    constructor(timelineService: TimelineService);
    find(query: QueryTimelineDto): Promise<import("./entities/timeline-event.entity").TimelineEvent[]>;
}
