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
exports.PregnancyProfile = exports.PregnancyProfileStatus = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/base/base.entity");
const profile_member_entity_1 = require("./profile-member.entity");
var PregnancyProfileStatus;
(function (PregnancyProfileStatus) {
    PregnancyProfileStatus["ACTIVE"] = "ACTIVE";
    PregnancyProfileStatus["COMPLETED"] = "COMPLETED";
    PregnancyProfileStatus["ARCHIVED"] = "ARCHIVED";
})(PregnancyProfileStatus || (exports.PregnancyProfileStatus = PregnancyProfileStatus = {}));
let PregnancyProfile = class PregnancyProfile extends base_entity_1.AppBaseEntity {
};
exports.PregnancyProfile = PregnancyProfile;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PregnancyProfile.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], PregnancyProfile.prototype, "expectedDueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], PregnancyProfile.prototype, "pregnancyStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PregnancyProfileStatus,
        default: PregnancyProfileStatus.ACTIVE
    }),
    __metadata("design:type", String)
], PregnancyProfile.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => profile_member_entity_1.ProfileMember, (member) => member.profile),
    __metadata("design:type", Array)
], PregnancyProfile.prototype, "members", void 0);
exports.PregnancyProfile = PregnancyProfile = __decorate([
    (0, typeorm_1.Entity)('pregnancy_profiles')
], PregnancyProfile);
//# sourceMappingURL=pregnancy-profile.entity.js.map