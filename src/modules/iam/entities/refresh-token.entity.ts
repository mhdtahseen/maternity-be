import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '@/common/base/base.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken extends AppBaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Index()
  @Column({ unique: true })
  tokenId: string;

  @Column()
  tokenHash: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;
}
