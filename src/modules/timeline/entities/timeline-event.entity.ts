import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '@/common/base/base.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';

export enum TimelineSourceType {
  MEDICAL_DOCUMENT = 'MEDICAL_DOCUMENT',
  DAILY_JOURNAL = 'DAILY_JOURNAL',
  MEMORY = 'MEMORY',
  SYSTEM = 'SYSTEM'
}

@Entity('timeline_events')
@Index(['profile', 'occurredAt'])
export class TimelineEvent extends AppBaseEntity {
  @ManyToOne(() => PregnancyProfile, { onDelete: 'CASCADE' })
  profile: PregnancyProfile;

  @Column({ type: 'enum', enum: TimelineSourceType })
  sourceType: TimelineSourceType;

  @Column()
  sourceId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamptz' })
  occurredAt: Date;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];
}
