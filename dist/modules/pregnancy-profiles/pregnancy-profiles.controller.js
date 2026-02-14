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
exports.PregnancyProfilesController = void 0;
const common_1 = require("@nestjs/common");
const pregnancy_profiles_service_1 = require("./pregnancy-profiles.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_1 = require("../../common/constants/permissions");
const create_profile_dto_1 = require("./dto/create-profile.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const manage_member_dto_1 = require("./dto/manage-member.dto");
let PregnancyProfilesController = class PregnancyProfilesController {
    constructor(profilesService) {
        this.profilesService = profilesService;
    }
    create(user, dto) {
        return this.profilesService.create(user.userId, dto);
    }
    getById(profileId) {
        return this.profilesService.findById(profileId);
    }
    addMember(profileId, dto) {
        return this.profilesService.addMember(profileId, dto);
    }
    updateMember(profileId, memberId, dto) {
        return this.profilesService.updateMember(profileId, memberId, dto);
    }
    removeMember(profileId, memberId) {
        return this.profilesService.removeMember(profileId, memberId);
    }
};
exports.PregnancyProfilesController = PregnancyProfilesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_profile_dto_1.CreateProfileDto]),
    __metadata("design:returntype", void 0)
], PregnancyProfilesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':profileId'),
    (0, permissions_decorator_1.RequirePermissions)(permissions_1.PERMISSIONS.PROFILE_READ),
    __param(0, (0, common_1.Param)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PregnancyProfilesController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(':profileId/members'),
    (0, permissions_decorator_1.RequirePermissions)(permissions_1.PERMISSIONS.PROFILE_MANAGE),
    __param(0, (0, common_1.Param)('profileId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, manage_member_dto_1.AddMemberDto]),
    __metadata("design:returntype", void 0)
], PregnancyProfilesController.prototype, "addMember", null);
__decorate([
    (0, common_1.Patch)(':profileId/members/:memberId'),
    (0, permissions_decorator_1.RequirePermissions)(permissions_1.PERMISSIONS.PROFILE_MANAGE),
    __param(0, (0, common_1.Param)('profileId')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, manage_member_dto_1.UpdateMemberDto]),
    __metadata("design:returntype", void 0)
], PregnancyProfilesController.prototype, "updateMember", null);
__decorate([
    (0, common_1.Delete)(':profileId/members/:memberId'),
    (0, permissions_decorator_1.RequirePermissions)(permissions_1.PERMISSIONS.PROFILE_MANAGE),
    __param(0, (0, common_1.Param)('profileId')),
    __param(1, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PregnancyProfilesController.prototype, "removeMember", null);
exports.PregnancyProfilesController = PregnancyProfilesController = __decorate([
    (0, common_1.Controller)('profiles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [pregnancy_profiles_service_1.PregnancyProfilesService])
], PregnancyProfilesController);
//# sourceMappingURL=pregnancy-profiles.controller.js.map