import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '@/common/base/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';

@Entity('audit_logs')
@Index(['actor', 'createdAt'])
@Index(['profile', 'createdAt'])
export class AuditLog extends AppBaseEntity {
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  actor?: User | null;

  @ManyToOne(() => PregnancyProfile, { nullable: true, onDelete: 'SET NULL' })
  profile?: PregnancyProfile | null;

  @Column()
  action: string;

  @Column()
  resourceType: string;

  @Column({ type: 'text', nullable: true })
  resourceId?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  ipAddress?: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent?: string | null;
}
