"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IamModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const jwt_strategy_1 = require("./jwt.strategy");
const user_entity_1 = require("../users/entities/user.entity");
const refresh_token_entity_1 = require("./entities/refresh-token.entity");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const rbac_service_1 = require("./rbac.service");
const profile_member_entity_1 = require("../pregnancy-profiles/entities/profile-member.entity");
const rbac_bootstrap_service_1 = require("./rbac-bootstrap.service");
let IamModule = class IamModule {
};
exports.IamModule = IamModule;
exports.IamModule = IamModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, refresh_token_entity_1.RefreshToken, role_entity_1.Role, permission_entity_1.Permission, profile_member_entity_1.ProfileMember]),
            jwt_1.JwtModule.register({})
        ],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, rbac_service_1.RbacService, rbac_bootstrap_service_1.RbacBootstrapService],
        controllers: [auth_controller_1.AuthController],
        exports: [rbac_service_1.RbacService]
    })
], IamModule);
//# sourceMappingURL=iam.module.js.map