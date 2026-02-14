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
exports.Memory = exports.MemoryMediaType = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/base/base.entity");
const pregnancy_profile_entity_1 = require("../../pregnancy-profiles/entities/pregnancy-profile.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var MemoryMediaType;
(function (MemoryMediaType) {
    MemoryMediaType["PHOTO"] = "PHOTO";
    MemoryMediaType["VIDEO"] = "VIDEO";
    MemoryMediaType["DOCUMENT"] = "DOCUMENT";
})(MemoryMediaType || (exports.MemoryMediaType = MemoryMediaType = {}));
let Memory = class Memory extends base_entity_1.AppBaseEntity {
};
exports.Memory = Memory;
__decorate([
    (0, typeorm_1.ManyToOne)(() => pregnancy_profile_entity_1.PregnancyProfile, { onDelete: 'CASCADE' }),
    __metadata("design:type", pregnancy_profile_entity_1.PregnancyProfile)
], Memory.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], Memory.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Memory.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Memory.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Memory.prototype, "memoryAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], Memory.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Memory.prototype, "mediaRefs", void 0);
exports.Memory = Memory = __decorate([
    (0, typeorm_1.Entity)('memories'),
    (0, typeorm_1.Index)(['profile', 'memoryAt'])
], Memory);
//# sourceMappingURL=memory.entity.js.map