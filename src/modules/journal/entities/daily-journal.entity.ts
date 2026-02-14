import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm';
import { AppBaseEntity } from '@/common/base/base.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity('daily_journals')
@Unique(['profile', 'author', 'entryDate'])
@Index(['profile', 'entryDate'])
export class DailyJournal extends AppBaseEntity {
  @ManyToOne(() => PregnancyProfile, { onDelete: 'CASCADE' })
  profile: PregnancyProfile;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  author: User;

  @Column({ type: 'date' })
  entryDate: string;

  @Column({ type: 'text', nullable: true })
  mood?: string | null;

  @Column({ type: 'text', array: true, default: '{}' })
  symptoms: string[];

  @Column({ type: 'float', nullable: true })
  sleepHours?: number | null;

  @Column({ type: 'text', nullable: true })
  appetite?: string | null;

  @Column({ type: 'float', nullable: true })
  weightKg?: number | null;

  @Column({ type: 'text', nullable: true })
  bloodPressure?: string | null;

  @Column({ type: 'int', nullable: true })
  babyKicksCount?: number | null;

  @Column({ default: false })
  doctorVisit: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  mediaRefs?: { fileId: string; type: 'PHOTO' | 'VIDEO' }[] | null;
}
