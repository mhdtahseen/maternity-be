import { AppBaseEntity } from '@/common/base/base.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { FileObject } from '@/modules/files/entities/file-object.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Medicine } from './medicine.entity';
export declare enum MedicalDocumentType {
    PRESCRIPTION = "PRESCRIPTION",
    LAB_REPORT = "LAB_REPORT",
    BILL = "BILL",
    SCAN = "SCAN",
    MRI = "MRI",
    ULTRASOUND = "ULTRASOUND",
    OTHER = "OTHER"
}
export declare enum MedicalPipelineStatus {
    RECEIVED = "RECEIVED",
    OCR_DONE = "OCR_DONE",
    LLM_DONE = "LLM_DONE",
    REVIEW_REQUIRED = "REVIEW_REQUIRED",
    FAILED = "FAILED"
}
export declare class MedicalDocument extends AppBaseEntity {
    profile: PregnancyProfile;
    file: FileObject;
    createdBy: User;
    pipelineStatus: MedicalPipelineStatus;
    documentType?: MedicalDocumentType | null;
    ocrText?: string | null;
    structuredJson?: Record<string, unknown> | null;
    summary?: string | null;
    authenticityScore?: number | null;
    authenticityFlagged: boolean;
    documentDate?: string | null;
    hospitalName?: string | null;
    doctorName?: string | null;
    pregnancyWeek?: number | null;
    tags: string[];
    medicines: Medicine[];
}
