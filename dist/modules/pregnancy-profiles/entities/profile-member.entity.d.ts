import { AppBaseEntity } from '@/common/base/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { PregnancyProfile } from './pregnancy-profile.entity';
import { Role } from '@/modules/iam/entities/role.entity';
export declare class ProfileMember extends AppBaseEntity {
    profile: PregnancyProfile;
    user: User;
    role: Role;
    canUploadMedicalDocs: boolean;
    canWriteJournal: boolean;
}
