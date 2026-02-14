import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
export declare class RbacBootstrapService implements OnModuleInit {
    private readonly roleRepository;
    private readonly permissionRepository;
    constructor(roleRepository: Repository<Role>, permissionRepository: Repository<Permission>);
    onModuleInit(): Promise<void>;
}
