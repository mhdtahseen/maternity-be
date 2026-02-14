import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '@/common/base/base.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { User } from '@/modules/users/entities/user.entity';

export enum MemoryMediaType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT'
}

export interface MemoryMediaRef {
  objectKey: string;
  bucket: string;
  fileName: string;
  mimeType: string;
  mediaType: MemoryMediaType;
  downloadUrl?: string;
}

@Entity('memories')
@Index(['profile', 'memoryAt'])
export class Memory extends AppBaseEntity {
  @ManyToOne(() => PregnancyProfile, { onDelete: 'CASCADE' })
  profile: PregnancyProfile;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  createdBy: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamptz' })
  memoryAt: Date;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  mediaRefs?: MemoryMediaRef[] | null;
}
