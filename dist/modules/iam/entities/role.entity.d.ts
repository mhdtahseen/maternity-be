import { AppBaseEntity } from '@/common/base/base.entity';
import { Permission } from './permission.entity';
export declare class Role extends AppBaseEntity {
    code: string;
    name: string;
    permissions: Permission[];
}
