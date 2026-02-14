import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PERMISSIONS } from '@/common/constants/permissions';
import { SystemRole } from '@/common/enums/roles.enum';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class RbacBootstrapService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) {}

  async onModuleInit(): Promise<void> {
    const permissionCodes = Object.values(PERMISSIONS);

    for (const code of permissionCodes) {
      const existing = await this.permissionRepository.findOne({ where: { code } });
      if (!existing) {
        await this.permissionRepository.save(this.permissionRepository.create({ code, name: code }));
      }
    }

    const persistedPermissions = await this.permissionRepository.find();
    const permissionByCode = new Map(persistedPermissions.map((perm) => [perm.code, perm]));

    const matrix: Record<SystemRole, string[]> = {
      [SystemRole.OWNER]: permissionCodes,
      [SystemRole.PARTNER]: [
        PERMISSIONS.PROFILE_READ,
        PERMISSIONS.JOURNAL_READ,
        PERMISSIONS.JOURNAL_WRITE,
        PERMISSIONS.DOCUMENT_READ,
        PERMISSIONS.DOCUMENT_UPLOAD,
        PERMISSIONS.MEMORY_READ,
        PERMISSIONS.MEMORY_WRITE,
        PERMISSIONS.TIMELINE_READ
      ],
      [SystemRole.FAMILY]: [
        PERMISSIONS.PROFILE_READ,
        PERMISSIONS.JOURNAL_READ,
        PERMISSIONS.DOCUMENT_READ,
        PERMISSIONS.MEMORY_READ,
        PERMISSIONS.TIMELINE_READ
      ],
      [SystemRole.DOCTOR]: [
        PERMISSIONS.PROFILE_READ,
        PERMISSIONS.DOCUMENT_READ,
        PERMISSIONS.TIMELINE_READ
      ],
      [SystemRole.ADMIN]: permissionCodes
    };

    for (const roleCode of Object.values(SystemRole)) {
      let role = await this.roleRepository.findOne({ where: { code: roleCode }, relations: ['permissions'] });

      if (!role) {
        role = this.roleRepository.create({ code: roleCode, name: roleCode });
      }

      role.permissions = matrix[roleCode].map((permissionCode) => permissionByCode.get(permissionCode)).filter(Boolean) as Permission[];
      await this.roleRepository.save(role);
    }
  }
}
