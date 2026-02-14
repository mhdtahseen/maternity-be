import { AppBaseEntity } from '@/common/base/base.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
export declare enum TimelineSourceType {
    MEDICAL_DOCUMENT = "MEDICAL_DOCUMENT",
    DAILY_JOURNAL = "DAILY_JOURNAL",
    MEMORY = "MEMORY",
    SYSTEM = "SYSTEM"
}
export declare class TimelineEvent extends AppBaseEntity {
    profile: PregnancyProfile;
    sourceType: TimelineSourceType;
    sourceId: string;
    title: string;
    description: string;
    occurredAt: Date;
    tags: string[];
}
