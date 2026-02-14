import { AppBaseEntity } from '@/common/base/base.entity';
import { ProfileMember } from './profile-member.entity';
export declare enum PregnancyProfileStatus {
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    ARCHIVED = "ARCHIVED"
}
export declare class PregnancyProfile extends AppBaseEntity {
    title: string;
    expectedDueDate: string;
    pregnancyStartDate?: string | null;
    status: PregnancyProfileStatus;
    members: ProfileMember[];
}
