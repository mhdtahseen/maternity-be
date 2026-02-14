import { SearchDocumentsDto, SearchTimelineDto } from './dto/search.dto';
import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    searchDocuments(query: SearchDocumentsDto): Promise<import("../medical-documents/entities/medical-document.entity").MedicalDocument[]>;
    searchTimeline(query: SearchTimelineDto): Promise<import("../timeline/entities/timeline-event.entity").TimelineEvent[]>;
}
