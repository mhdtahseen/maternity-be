import { Column, Entity, OneToMany } from 'typeorm';
import { AppBaseEntity } from '@/common/base/base.entity';
import { ProfileMember } from '@/modules/pregnancy-profiles/entities/profile-member.entity';

@Entity('users')
export class User extends AppBaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  mfaEnabled: boolean;

  @OneToMany(() => ProfileMember, (member) => member.user)
  memberships: ProfileMember[];
}
