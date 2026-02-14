import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QUEUES } from '@/common/constants/queues';
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

@Injectable()
@Processor(QUEUES.TIMELINE_BUILD)
export class TimelineBuildProcessor extends WorkerHost {
  constructor(
    @InjectRepository(TimelineEvent)
    private readonly timelineRepository: Repository<TimelineEvent>
  ) {
    super();
  }

  async process(job: Job<TimelineBuildJobData>): Promise<void> {
    const data = job.data;

    const timelineEvent = this.timelineRepository.create({
      profile: { id: data.profileId } as any,
      sourceType: TimelineSourceType[data.sourceType] ?? TimelineSourceType.SYSTEM,
      sourceId: data.sourceId,
      title: data.title,
      description: data.description ?? data.title,
      occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
      tags: data.tags ?? []
    });

    await this.timelineRepository.save(timelineEvent);
  }
}
