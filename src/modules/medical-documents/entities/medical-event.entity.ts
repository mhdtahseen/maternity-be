import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '@/common/base/base.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { MedicalDocument } from './medical-document.entity';

@Entity('medical_events')
@Index(['profile', 'eventAt'])
export class MedicalEvent extends AppBaseEntity {
  @ManyToOne(() => PregnancyProfile, { onDelete: 'CASCADE' })
  profile: PregnancyProfile;

  @ManyToOne(() => MedicalDocument, { onDelete: 'SET NULL', nullable: true })
  sourceDocument?: MedicalDocument | null;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamptz' })
  eventAt: Date;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];
}
