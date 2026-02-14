"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RbacBootstrapService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const permissions_1 = require("../../common/constants/permissions");
const roles_enum_1 = require("../../common/enums/roles.enum");
const permission_entity_1 = require("./entities/permission.entity");
const role_entity_1 = require("./entities/role.entity");
let RbacBootstrapService = class RbacBootstrapService {
    constructor(roleRepository, permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }
    async onModuleInit() {
        const permissionCodes = Object.values(permissions_1.PERMISSIONS);
        for (const code of permissionCodes) {
            const existing = await this.permissionRepository.findOne({ where: { code } });
            if (!existing) {
                await this.permissionRepository.save(this.permissionRepository.create({ code, name: code }));
            }
        }
        const persistedPermissions = await this.permissionRepository.find();
        const permissionByCode = new Map(persistedPermissions.map((perm) => [perm.code, perm]));
        const matrix = {
            [roles_enum_1.SystemRole.OWNER]: permissionCodes,
            [roles_enum_1.SystemRole.PARTNER]: [
                permissions_1.PERMISSIONS.PROFILE_READ,
                permissions_1.PERMISSIONS.JOURNAL_READ,
                permissions_1.PERMISSIONS.JOURNAL_WRITE,
                permissions_1.PERMISSIONS.DOCUMENT_READ,
                permissions_1.PERMISSIONS.DOCUMENT_UPLOAD,
                permissions_1.PERMISSIONS.MEMORY_READ,
                permissions_1.PERMISSIONS.MEMORY_WRITE,
                permissions_1.PERMISSIONS.TIMELINE_READ
            ],
            [roles_enum_1.SystemRole.FAMILY]: [
                permissions_1.PERMISSIONS.PROFILE_READ,
                permissions_1.PERMISSIONS.JOURNAL_READ,
                permissions_1.PERMISSIONS.DOCUMENT_READ,
                permissions_1.PERMISSIONS.MEMORY_READ,
                permissions_1.PERMISSIONS.TIMELINE_READ
            ],
            [roles_enum_1.SystemRole.DOCTOR]: [
                permissions_1.PERMISSIONS.PROFILE_READ,
                permissions_1.PERMISSIONS.DOCUMENT_READ,
                permissions_1.PERMISSIONS.TIMELINE_READ
            ],
            [roles_enum_1.SystemRole.ADMIN]: permissionCodes
        };
        for (const roleCode of Object.values(roles_enum_1.SystemRole)) {
            let role = await this.roleRepository.findOne({ where: { code: roleCode }, relations: ['permissions'] });
            if (!role) {
                role = this.roleRepository.create({ code: roleCode, name: roleCode });
            }
            role.permissions = matrix[roleCode].map((permissionCode) => permissionByCode.get(permissionCode)).filter(Boolean);
            await this.roleRepository.save(role);
        }
    }
};
exports.RbacBootstrapService = RbacBootstrapService;
exports.RbacBootstrapService = RbacBootstrapService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RbacBootstrapService);
//# sourceMappingURL=rbac-bootstrap.service.js.map