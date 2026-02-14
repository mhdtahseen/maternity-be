import { AppBaseEntity } from '@/common/base/base.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { User } from '@/modules/users/entities/user.entity';
export declare enum FileObjectStatus {
    UPLOADED = "UPLOADED",
    NORMALIZED = "NORMALIZED",
    FAILED = "FAILED"
}
export declare class FileObject extends AppBaseEntity {
    profile: PregnancyProfile;
    uploadedBy: User;
    bucket: string;
    objectKey: string;
    originalName: string;
    mimeType: string;
    sizeBytes: string;
    checksumSha256: string;
    status: FileObjectStatus;
    normalizedObjectKey?: string | null;
}
