import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { AppBaseEntity } from '@/common/base/base.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { FileObject } from '@/modules/files/entities/file-object.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Medicine } from './medicine.entity';

export enum MedicalDocumentType {
  PRESCRIPTION = 'PRESCRIPTION',
  LAB_REPORT = 'LAB_REPORT',
  BILL = 'BILL',
  SCAN = 'SCAN',
  MRI = 'MRI',
  ULTRASOUND = 'ULTRASOUND',
  OTHER = 'OTHER'
}

export enum MedicalPipelineStatus {
  RECEIVED = 'RECEIVED',
  OCR_DONE = 'OCR_DONE',
  LLM_DONE = 'LLM_DONE',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  FAILED = 'FAILED'
}

@Entity('medical_documents')
@Index(['profile', 'documentDate'])
export class MedicalDocument extends AppBaseEntity {
  @ManyToOne(() => PregnancyProfile, { onDelete: 'CASCADE' })
  profile: PregnancyProfile;

  @ManyToOne(() => FileObject, { eager: true, onDelete: 'CASCADE' })
  file: FileObject;

  @ManyToOne(() => User, { eager: true })
  createdBy: User;

  @Column({ type: 'enum', enum: MedicalPipelineStatus, default: MedicalPipelineStatus.RECEIVED })
  pipelineStatus: MedicalPipelineStatus;

  @Column({ type: 'enum', enum: MedicalDocumentType, nullable: true })
  documentType?: MedicalDocumentType | null;

  @Column({ type: 'text', nullable: true })
  ocrText?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  structuredJson?: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  summary?: string | null;

  @Column({ type: 'float', nullable: true })
  authenticityScore?: number | null;

  @Column({ default: false })
  authenticityFlagged: boolean;

  @Column({ type: 'date', nullable: true })
  documentDate?: string | null;

  @Column({ type: 'text', nullable: true })
  hospitalName?: string | null;

  @Column({ type: 'text', nullable: true })
  doctorName?: string | null;

  @Column({ type: 'int', nullable: true })
  pregnancyWeek?: number | null;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @OneToMany(() => Medicine, (medicine) => medicine.document, { cascade: true })
  medicines: Medicine[];
}
