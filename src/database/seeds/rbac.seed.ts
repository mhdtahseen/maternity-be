import 'reflect-metadata';
import dataSource from '../typeorm.config';
import { Permission } from '@/modules/iam/entities/permission.entity';
import { Role } from '@/modules/iam/entities/role.entity';
import { PERMISSIONS } from '@/common/constants/permissions';
import { SystemRole } from '@/common/enums/roles.enum';

async function run(): Promise<void> {
  await dataSource.initialize();

  const permissionRepo = dataSource.getRepository(Permission);
  const roleRepo = dataSource.getRepository(Role);

  for (const code of Object.values(PERMISSIONS)) {
    let permission = await permissionRepo.findOne({ where: { code } });
    if (!permission) {
      permission = permissionRepo.create({ code, name: code });
      await permissionRepo.save(permission);
    }
  }

  const permissions = await permissionRepo.find();

  for (const roleCode of Object.values(SystemRole)) {
    let role = await roleRepo.findOne({ where: { code: roleCode }, relations: ['permissions'] });

    if (!role) {
      role = roleRepo.create({ code: roleCode, name: roleCode });
    }

    role.permissions = permissions;
    await roleRepo.save(role);
  }

  await dataSource.destroy();
}

run().catch(async (error) => {
  console.error(error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
