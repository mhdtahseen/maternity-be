import { Repository } from 'typeorm';
import { MedicalDocument } from '@/modules/medical-documents/entities/medical-document.entity';
import { TimelineEvent } from '@/modules/timeline/entities/timeline-event.entity';
import { SearchDocumentsDto, SearchTimelineDto } from './dto/search.dto';
export declare class SearchService {
    private readonly documentRepository;
    private readonly timelineRepository;
    constructor(documentRepository: Repository<MedicalDocument>, timelineRepository: Repository<TimelineEvent>);
    searchDocuments(dto: SearchDocumentsDto): Promise<MedicalDocument[]>;
    searchTimeline(dto: SearchTimelineDto): Promise<TimelineEvent[]>;
}
