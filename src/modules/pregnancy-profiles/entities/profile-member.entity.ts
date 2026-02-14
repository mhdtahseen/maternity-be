import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm';
import { AppBaseEntity } from '@/common/base/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { PregnancyProfile } from './pregnancy-profile.entity';
import { Role } from '@/modules/iam/entities/role.entity';

@Entity('profile_members')
@Unique(['profile', 'user'])
export class ProfileMember extends AppBaseEntity {
  @ManyToOne(() => PregnancyProfile, (profile) => profile.members, { onDelete: 'CASCADE' })
  @Index()
  profile: PregnancyProfile;

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @Index()
  user: User;

  @ManyToOne(() => Role, { eager: true })
  role: Role;

  @Column({ default: true })
  canUploadMedicalDocs: boolean;

  @Column({ default: true })
  canWriteJournal: boolean;
}
