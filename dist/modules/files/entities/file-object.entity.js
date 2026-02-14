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
exports.FileObject = exports.FileObjectStatus = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/base/base.entity");
const pregnancy_profile_entity_1 = require("../../pregnancy-profiles/entities/pregnancy-profile.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var FileObjectStatus;
(function (FileObjectStatus) {
    FileObjectStatus["UPLOADED"] = "UPLOADED";
    FileObjectStatus["NORMALIZED"] = "NORMALIZED";
    FileObjectStatus["FAILED"] = "FAILED";
})(FileObjectStatus || (exports.FileObjectStatus = FileObjectStatus = {}));
let FileObject = class FileObject extends base_entity_1.AppBaseEntity {
};
exports.FileObject = FileObject;
__decorate([
    (0, typeorm_1.ManyToOne)(() => pregnancy_profile_entity_1.PregnancyProfile, { onDelete: 'CASCADE' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", pregnancy_profile_entity_1.PregnancyProfile)
], FileObject.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    __metadata("design:type", user_entity_1.User)
], FileObject.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FileObject.prototype, "bucket", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], FileObject.prototype, "objectKey", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FileObject.prototype, "originalName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FileObject.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", String)
], FileObject.prototype, "sizeBytes", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FileObject.prototype, "checksumSha256", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: FileObjectStatus, default: FileObjectStatus.UPLOADED }),
    __metadata("design:type", String)
], FileObject.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], FileObject.prototype, "normalizedObjectKey", void 0);
exports.FileObject = FileObject = __decorate([
    (0, typeorm_1.Entity)('files')
], FileObject);
//# sourceMappingURL=file-object.entity.js.map