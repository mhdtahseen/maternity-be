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
exports.PregnancyProfilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pregnancy_profile_entity_1 = require("./entities/pregnancy-profile.entity");
const profile_member_entity_1 = require("./entities/profile-member.entity");
const user_entity_1 = require("../users/entities/user.entity");
const role_entity_1 = require("../iam/entities/role.entity");
const roles_enum_1 = require("../../common/enums/roles.enum");
let PregnancyProfilesService = class PregnancyProfilesService {
    constructor(profileRepository, profileMemberRepository, userRepository, roleRepository) {
        this.profileRepository = profileRepository;
        this.profileMemberRepository = profileMemberRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    async create(ownerUserId, dto) {
        const profile = this.profileRepository.create({
            title: dto.title,
            expectedDueDate: dto.expectedDueDate,
            pregnancyStartDate: dto.pregnancyStartDate,
            status: pregnancy_profile_entity_1.PregnancyProfileStatus.ACTIVE
        });
        const savedProfile = await this.profileRepository.save(profile);
        const ownerUser = await this.userRepository.findOne({ where: { id: ownerUserId } });
        const ownerRole = await this.roleRepository.findOne({ where: { code: roles_enum_1.SystemRole.OWNER } });
        if (!ownerUser || !ownerRole) {
            throw new common_1.NotFoundException('Owner user or OWNER role not found');
        }
        const member = this.profileMemberRepository.create({
            profile: savedProfile,
            user: ownerUser,
            role: ownerRole,
            canUploadMedicalDocs: true,
            canWriteJournal: true
        });
        await this.profileMemberRepository.save(member);
        return this.findById(savedProfile.id);
    }
    async findById(profileId) {
        const profile = await this.profileRepository.findOne({
            where: { id: profileId },
            relations: ['members', 'members.user', 'members.role']
        });
        if (!profile) {
            throw new common_1.NotFoundException('Profile not found');
        }
        return profile;
    }
    async addMember(profileId, dto) {
        const [profile, user, role] = await Promise.all([
            this.profileRepository.findOne({ where: { id: profileId } }),
            this.userRepository.findOne({ where: { email: dto.email.toLowerCase(), isActive: true } }),
            this.roleRepository.findOne({ where: { code: dto.roleCode.toUpperCase() } })
        ]);
        if (!profile || !user || !role) {
            throw new common_1.NotFoundException('Profile, user, or role not found');
        }
        const member = this.profileMemberRepository.create({
            profile,
            user,
            role,
            canUploadMedicalDocs: dto.canUploadMedicalDocs ?? true,
            canWriteJournal: dto.canWriteJournal ?? true
        });
        return this.profileMemberRepository.save(member);
    }
    async updateMember(profileId, memberId, dto) {
        const member = await this.profileMemberRepository.findOne({
            where: { id: memberId, profile: { id: profileId } },
            relations: ['role']
        });
        if (!member) {
            throw new common_1.NotFoundException('Member not found');
        }
        if (dto.roleCode) {
            const role = await this.roleRepository.findOne({ where: { code: dto.roleCode.toUpperCase() } });
            if (!role) {
                throw new common_1.NotFoundException('Role not found');
            }
            member.role = role;
        }
        if (dto.canUploadMedicalDocs !== undefined) {
            member.canUploadMedicalDocs = dto.canUploadMedicalDocs;
        }
        if (dto.canWriteJournal !== undefined) {
            member.canWriteJournal = dto.canWriteJournal;
        }
        return this.profileMemberRepository.save(member);
    }
    async removeMember(profileId, memberId) {
        await this.profileMemberRepository.delete({ id: memberId, profile: { id: profileId } });
    }
};
exports.PregnancyProfilesService = PregnancyProfilesService;
exports.PregnancyProfilesService = PregnancyProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pregnancy_profile_entity_1.PregnancyProfile)),
    __param(1, (0, typeorm_1.InjectRepository)(profile_member_entity_1.ProfileMember)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PregnancyProfilesService);
//# sourceMappingURL=pregnancy-profiles.service.js.map