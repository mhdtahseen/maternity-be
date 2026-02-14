import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { User } from '@/modules/users/entities/user.entity';
import { CreateDailyJournalDto, QueryDailyJournalDto, UpdateDailyJournalDto } from './dto/daily-journal.dto';
import { DailyJournal } from './entities/daily-journal.entity';
export declare class JournalService {
    private readonly journalRepository;
    private readonly profileRepository;
    private readonly userRepository;
    private readonly timelineQueue;
    constructor(journalRepository: Repository<DailyJournal>, profileRepository: Repository<PregnancyProfile>, userRepository: Repository<User>, timelineQueue: Queue);
    create(userId: string, dto: CreateDailyJournalDto): Promise<DailyJournal>;
    find(query: QueryDailyJournalDto): Promise<DailyJournal[]>;
    update(profileId: string, id: string, dto: UpdateDailyJournalDto): Promise<DailyJournal>;
    remove(profileId: string, id: string): Promise<void>;
}
