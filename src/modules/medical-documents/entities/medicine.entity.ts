import { Column, Entity, ManyToOne } from 'typeorm';
import { AppBaseEntity } from '@/common/base/base.entity';
import { MedicalDocument } from './medical-document.entity';

@Entity('medicines')
export class Medicine extends AppBaseEntity {
  @ManyToOne(() => MedicalDocument, (document) => document.medicines, { onDelete: 'CASCADE' })
  document: MedicalDocument;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  dosage?: string | null;

  @Column({ type: 'text', nullable: true })
  frequency?: string | null;

  @Column({ type: 'text', nullable: true })
  reason?: string | null;
}
