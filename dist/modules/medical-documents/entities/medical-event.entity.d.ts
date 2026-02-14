import { AppBaseEntity } from '@/common/base/base.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { MedicalDocument } from './medical-document.entity';
export declare class MedicalEvent extends AppBaseEntity {
    profile: PregnancyProfile;
    sourceDocument?: MedicalDocument | null;
    title: string;
    description: string;
    eventAt: Date;
    tags: string[];
}
