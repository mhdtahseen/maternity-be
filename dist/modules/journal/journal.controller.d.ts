import { CreateDailyJournalDto, QueryDailyJournalDto, UpdateDailyJournalDto } from './dto/daily-journal.dto';
import { JournalService } from './journal.service';
export declare class JournalController {
    private readonly journalService;
    constructor(journalService: JournalService);
    create(user: {
        userId: string;
    }, dto: CreateDailyJournalDto): Promise<import("./entities/daily-journal.entity").DailyJournal>;
    find(query: QueryDailyJournalDto): Promise<import("./entities/daily-journal.entity").DailyJournal[]>;
    update(id: string, profileId: string, dto: UpdateDailyJournalDto): Promise<import("./entities/daily-journal.entity").DailyJournal>;
    remove(id: string, profileId: string): Promise<void>;
}
