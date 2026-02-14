import { AppBaseEntity } from '@/common/base/base.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { User } from '@/modules/users/entities/user.entity';
export declare class DailyJournal extends AppBaseEntity {
    profile: PregnancyProfile;
    author: User;
    entryDate: string;
    mood?: string | null;
    symptoms: string[];
    sleepHours?: number | null;
    appetite?: string | null;
    weightKg?: number | null;
    bloodPressure?: string | null;
    babyKicksCount?: number | null;
    doctorVisit: boolean;
    notes?: string | null;
    mediaRefs?: {
        fileId: string;
        type: 'PHOTO' | 'VIDEO';
    }[] | null;
}
