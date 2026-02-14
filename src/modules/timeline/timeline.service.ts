import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryTimelineDto } from './dto/query-timeline.dto';
import { TimelineEvent } from './entities/timeline-event.entity';

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(TimelineEvent)
    private readonly timelineRepository: Repository<TimelineEvent>
  ) {}

  async find(query: QueryTimelineDto): Promise<TimelineEvent[]> {
    const qb = this.timelineRepository
      .createQueryBuilder('timeline')
      .where('timeline.profileId = :profileId', { profileId: query.profileId });

    if (query.from) {
      qb.andWhere('timeline.occurredAt >= :from', { from: query.from });
    }

    if (query.to) {
      qb.andWhere('timeline.occurredAt <= :to', { to: query.to });
    }

    if (query.sourceType) {
      qb.andWhere('timeline.sourceType = :sourceType', { sourceType: query.sourceType });
    }

    qb.orderBy('timeline.occurredAt', 'DESC');
    return qb.getMany();
  }

  async create(payload: Partial<TimelineEvent>): Promise<TimelineEvent> {
    const event = this.timelineRepository.create(payload);
    return this.timelineRepository.save(event);
  }
}
