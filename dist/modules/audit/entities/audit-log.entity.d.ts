import { AppBaseEntity } from '@/common/base/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
export declare class AuditLog extends AppBaseEntity {
    actor?: User | null;
    profile?: PregnancyProfile | null;
    action: string;
    resourceType: string;
    resourceId?: string | null;
    metadata?: Record<string, unknown> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
}
