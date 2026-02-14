import { AppBaseEntity } from '@/common/base/base.entity';
import { Role } from './role.entity';
export declare class Permission extends AppBaseEntity {
    code: string;
    name: string;
    roles: Role[];
}
