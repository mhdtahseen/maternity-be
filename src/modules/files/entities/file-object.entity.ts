import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '@/common/base/base.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { User } from '@/modules/users/entities/user.entity';

export enum FileObjectStatus {
  UPLOADED = 'UPLOADED',
  NORMALIZED = 'NORMALIZED',
  FAILED = 'FAILED'
}

@Entity('files')
export class FileObject extends AppBaseEntity {
  @ManyToOne(() => PregnancyProfile, { onDelete: 'CASCADE' })
  @Index()
  profile: PregnancyProfile;

  @ManyToOne(() => User, { eager: true })
  uploadedBy: User;

  @Column()
  bucket: string;

  @Column({ unique: true })
  objectKey: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column({ type: 'bigint' })
  sizeBytes: string;

  @Column()
  checksumSha256: string;

  @Column({ type: 'enum', enum: FileObjectStatus, default: FileObjectStatus.UPLOADED })
  status: FileObjectStatus;

  @Column({ type: 'text', nullable: true })
  normalizedObjectKey?: string | null;
}
