import { Column, Entity, OneToMany } from 'typeorm';
import { AppBaseEntity } from '@/common/base/base.entity';
import { ProfileMember } from './profile-member.entity';

export enum PregnancyProfileStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

@Entity('pregnancy_profiles')
export class PregnancyProfile extends AppBaseEntity {
  @Column()
  title: string;

  @Column({ type: 'date' })
  expectedDueDate: string;

  @Column({ type: 'date', nullable: true })
  pregnancyStartDate?: string | null;

  @Column({
    type: 'enum',
    enum: PregnancyProfileStatus,
    default: PregnancyProfileStatus.ACTIVE
  })
  status: PregnancyProfileStatus;

  @OneToMany(() => ProfileMember, (member) => member.profile)
  members: ProfileMember[];
}
