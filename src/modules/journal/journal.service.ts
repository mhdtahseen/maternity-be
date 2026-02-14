import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { JOB_NAMES, QUEUES } from '@/common/constants/queues';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { User } from '@/modules/users/entities/user.entity';
import { CreateDailyJournalDto, QueryDailyJournalDto, UpdateDailyJournalDto } from './dto/daily-journal.dto';
import { DailyJournal } from './entities/daily-journal.entity';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(DailyJournal)
    private readonly journalRepository: Repository<DailyJournal>,
    @InjectRepository(PregnancyProfile)
    private readonly profileRepository: Repository<PregnancyProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectQueue(QUEUES.TIMELINE_BUILD)
    private readonly timelineQueue: Queue
  ) {}

  async create(userId: string, dto: CreateDailyJournalDto): Promise<DailyJournal> {
    const [profile, user] = await Promise.all([
      this.profileRepository.findOne({ where: { id: dto.profileId } }),
      this.userRepository.findOne({ where: { id: userId } })
    ]);

    if (!profile || !user) {
      throw new NotFoundException('Profile or user not found');
    }

    const entity = this.journalRepository.create({
      profile,
      author: user,
      entryDate: dto.entryDate,
      mood: dto.mood,
      symptoms: dto.symptoms ?? [],
      sleepHours: dto.sleepHours,
      appetite: dto.appetite,
      weightKg: dto.weightKg,
      bloodPressure: dto.bloodPressure,
      babyKicksCount: dto.babyKicksCount,
      doctorVisit: dto.doctorVisit ?? false,
      notes: dto.notes
    });

    const saved = await this.journalRepository.save(entity);

    await this.timelineQueue.add(
      JOB_NAMES.BUILD_TIMELINE_EVENT,
      {
        sourceType: 'DAILY_JOURNAL',
        sourceId: saved.id,
        profileId: dto.profileId,
        title: `Daily journal - ${dto.entryDate}`
      },
      { removeOnComplete: true, removeOnFail: false, jobId: `${saved.id}-timeline` }
    );

    return saved;
  }

  async find(query: QueryDailyJournalDto): Promise<DailyJournal[]> {
    const qb = this.journalRepository
      .createQueryBuilder('journal')
      .leftJoinAndSelect('journal.author', 'author')
      .where('journal.profileId = :profileId', { profileId: query.profileId });

    if (query.date) {
      qb.andWhere('journal.entryDate = :date', { date: query.date });
    }

    if (query.from) {
      qb.andWhere('journal.entryDate >= :from', { from: query.from });
    }

    if (query.to) {
      qb.andWhere('journal.entryDate <= :to', { to: query.to });
    }

    qb.orderBy('journal.entryDate', 'DESC');

    return qb.getMany();
  }

  async update(profileId: string, id: string, dto: UpdateDailyJournalDto): Promise<DailyJournal> {
    const journal = await this.journalRepository.findOne({ where: { id, profile: { id: profileId } }, relations: ['profile'] });

    if (!journal) {
      throw new NotFoundException('Journal entry not found');
    }

    Object.assign(journal, dto);
    return this.journalRepository.save(journal);
  }

  async remove(profileId: string, id: string): Promise<void> {
    await this.journalRepository.delete({ id, profile: { id: profileId } });
  }
}
