import { AppBaseEntity } from '@/common/base/base.entity';
import { MedicalDocument } from './medical-document.entity';
export declare class Medicine extends AppBaseEntity {
    document: MedicalDocument;
    name: string;
    dosage?: string | null;
    frequency?: string | null;
    reason?: string | null;
}
