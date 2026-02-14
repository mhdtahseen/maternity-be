import { AppBaseEntity } from '@/common/base/base.entity';
import { User } from '@/modules/users/entities/user.entity';
export declare class RefreshToken extends AppBaseEntity {
    user: User;
    tokenId: string;
    tokenHash: string;
    expiresAt: Date;
    revoked: boolean;
}
