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
exports.RbacService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const profile_member_entity_1 = require("../pregnancy-profiles/entities/profile-member.entity");
let RbacService = class RbacService {
    constructor(profileMemberRepository) {
        this.profileMemberRepository = profileMemberRepository;
    }
    async hasPermissions(userId, profileId, required) {
        const membership = await this.profileMemberRepository.findOne({
            where: { user: { id: userId }, profile: { id: profileId } },
            relations: ['role', 'role.permissions']
        });
        if (!membership) {
            return false;
        }
        const owned = new Set((membership.role.permissions ?? []).map((item) => item.code));
        return required.every((perm) => owned.has(perm));
    }
};
exports.RbacService = RbacService;
exports.RbacService = RbacService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(profile_member_entity_1.ProfileMember)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RbacService);
//# sourceMappingURL=rbac.service.js.map