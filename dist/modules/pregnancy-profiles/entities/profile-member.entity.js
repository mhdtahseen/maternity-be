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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileMember = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/base/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const pregnancy_profile_entity_1 = require("./pregnancy-profile.entity");
const role_entity_1 = require("../../iam/entities/role.entity");
let ProfileMember = class ProfileMember extends base_entity_1.AppBaseEntity {
};
exports.ProfileMember = ProfileMember;
__decorate([
    (0, typeorm_1.ManyToOne)(() => pregnancy_profile_entity_1.PregnancyProfile, (profile) => profile.members, { onDelete: 'CASCADE' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", pregnancy_profile_entity_1.PregnancyProfile)
], ProfileMember.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.memberships, { onDelete: 'CASCADE' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", user_entity_1.User)
], ProfileMember.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role, { eager: true }),
    __metadata("design:type", role_entity_1.Role)
], ProfileMember.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ProfileMember.prototype, "canUploadMedicalDocs", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ProfileMember.prototype, "canWriteJournal", void 0);
exports.ProfileMember = ProfileMember = __decorate([
    (0, typeorm_1.Entity)('profile_members'),
    (0, typeorm_1.Unique)(['profile', 'user'])
], ProfileMember);
//# sourceMappingURL=profile-member.entity.js.map