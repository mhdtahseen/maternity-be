import { AppBaseEntity } from '@/common/base/base.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { User } from '@/modules/users/entities/user.entity';
export declare enum MemoryMediaType {
    PHOTO = "PHOTO",
    VIDEO = "VIDEO",
    DOCUMENT = "DOCUMENT"
}
export interface MemoryMediaRef {
    objectKey: string;
    bucket: string;
    fileName: string;
    mimeType: string;
    mediaType: MemoryMediaType;
    downloadUrl?: string;
}
export declare class Memory extends AppBaseEntity {
    profile: PregnancyProfile;
    createdBy: User;
    title: string;
    description: string;
    memoryAt: Date;
    tags: string[];
    mediaRefs?: MemoryMediaRef[] | null;
}
