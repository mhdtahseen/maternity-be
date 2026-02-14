"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_config_1 = require("../typeorm.config");
const permission_entity_1 = require("../../modules/iam/entities/permission.entity");
const role_entity_1 = require("../../modules/iam/entities/role.entity");
const permissions_1 = require("../../common/constants/permissions");
const roles_enum_1 = require("../../common/enums/roles.enum");
async function run() {
    await typeorm_config_1.default.initialize();
    const permissionRepo = typeorm_config_1.default.getRepository(permission_entity_1.Permission);
    const roleRepo = typeorm_config_1.default.getRepository(role_entity_1.Role);
    for (const code of Object.values(permissions_1.PERMISSIONS)) {
        let permission = await permissionRepo.findOne({ where: { code } });
        if (!permission) {
            permission = permissionRepo.create({ code, name: code });
            await permissionRepo.save(permission);
        }
    }
    const permissions = await permissionRepo.find();
    for (const roleCode of Object.values(roles_enum_1.SystemRole)) {
        let role = await roleRepo.findOne({ where: { code: roleCode }, relations: ['permissions'] });
        if (!role) {
            role = roleRepo.create({ code: roleCode, name: roleCode });
        }
        role.permissions = permissions;
        await roleRepo.save(role);
    }
    await typeorm_config_1.default.destroy();
}
run().catch(async (error) => {
    console.error(error);
    if (typeorm_config_1.default.isInitialized) {
        await typeorm_config_1.default.destroy();
    }
    process.exit(1);
});
//# sourceMappingURL=rbac.seed.js.map