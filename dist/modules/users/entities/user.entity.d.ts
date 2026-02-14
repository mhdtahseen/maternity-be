import { AppBaseEntity } from '@/common/base/base.entity';
import { ProfileMember } from '@/modules/pregnancy-profiles/entities/profile-member.entity';
export declare class User extends AppBaseEntity {
    email: string;
    passwordHash: string;
    fullName: string;
    phone?: string;
    isActive: boolean;
    mfaEnabled: boolean;
    memberships: ProfileMember[];
}
