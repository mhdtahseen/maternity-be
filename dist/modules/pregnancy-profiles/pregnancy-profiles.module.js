"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PregnancyProfilesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pregnancy_profile_entity_1 = require("./entities/pregnancy-profile.entity");
const profile_member_entity_1 = require("./entities/profile-member.entity");
const pregnancy_profiles_service_1 = require("./pregnancy-profiles.service");
const pregnancy_profiles_controller_1 = require("./pregnancy-profiles.controller");
const user_entity_1 = require("../users/entities/user.entity");
const role_entity_1 = require("../iam/entities/role.entity");
let PregnancyProfilesModule = class PregnancyProfilesModule {
};
exports.PregnancyProfilesModule = PregnancyProfilesModule;
exports.PregnancyProfilesModule = PregnancyProfilesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([pregnancy_profile_entity_1.PregnancyProfile, profile_member_entity_1.ProfileMember, user_entity_1.User, role_entity_1.Role])],
        providers: [pregnancy_profiles_service_1.PregnancyProfilesService],
        controllers: [pregnancy_profiles_controller_1.PregnancyProfilesController],
        exports: [pregnancy_profiles_service_1.PregnancyProfilesService, typeorm_1.TypeOrmModule]
    })
], PregnancyProfilesModule);
//# sourceMappingURL=pregnancy-profiles.module.js.map