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
exports.MedicalDocument = exports.MedicalPipelineStatus = exports.MedicalDocumentType = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/base/base.entity");
const pregnancy_profile_entity_1 = require("../../pregnancy-profiles/entities/pregnancy-profile.entity");
const file_object_entity_1 = require("../../files/entities/file-object.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const medicine_entity_1 = require("./medicine.entity");
var MedicalDocumentType;
(function (MedicalDocumentType) {
    MedicalDocumentType["PRESCRIPTION"] = "PRESCRIPTION";
    MedicalDocumentType["LAB_REPORT"] = "LAB_REPORT";
    MedicalDocumentType["BILL"] = "BILL";
    MedicalDocumentType["SCAN"] = "SCAN";
    MedicalDocumentType["MRI"] = "MRI";
    MedicalDocumentType["ULTRASOUND"] = "ULTRASOUND";
    MedicalDocumentType["OTHER"] = "OTHER";
})(MedicalDocumentType || (exports.MedicalDocumentType = MedicalDocumentType = {}));
var MedicalPipelineStatus;
(function (MedicalPipelineStatus) {
    MedicalPipelineStatus["RECEIVED"] = "RECEIVED";
    MedicalPipelineStatus["OCR_DONE"] = "OCR_DONE";
    MedicalPipelineStatus["LLM_DONE"] = "LLM_DONE";
    MedicalPipelineStatus["REVIEW_REQUIRED"] = "REVIEW_REQUIRED";
    MedicalPipelineStatus["FAILED"] = "FAILED";
})(MedicalPipelineStatus || (exports.MedicalPipelineStatus = MedicalPipelineStatus = {}));
let MedicalDocument = class MedicalDocument extends base_entity_1.AppBaseEntity {
};
exports.MedicalDocument = MedicalDocument;
__decorate([
    (0, typeorm_1.ManyToOne)(() => pregnancy_profile_entity_1.PregnancyProfile, { onDelete: 'CASCADE' }),
    __metadata("design:type", pregnancy_profile_entity_1.PregnancyProfile)
], MedicalDocument.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => file_object_entity_1.FileObject, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", file_object_entity_1.FileObject)
], MedicalDocument.prototype, "file", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    __metadata("design:type", user_entity_1.User)
], MedicalDocument.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MedicalPipelineStatus, default: MedicalPipelineStatus.RECEIVED }),
    __metadata("design:type", String)
], MedicalDocument.prototype, "pipelineStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MedicalDocumentType, nullable: true }),
    __metadata("design:type", Object)
], MedicalDocument.prototype, "documentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], MedicalDocument.prototype, "ocrText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], MedicalDocument.prototype, "structuredJson", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], MedicalDocument.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Object)
], MedicalDocument.prototype, "authenticityScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], MedicalDocument.prototype, "authenticityFlagged", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], MedicalDocument.prototype, "documentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], MedicalDocument.prototype, "hospitalName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], MedicalDocument.prototype, "doctorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], MedicalDocument.prototype, "pregnancyWeek", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], MedicalDocument.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => medicine_entity_1.Medicine, (medicine) => medicine.document, { cascade: true }),
    __metadata("design:type", Array)
], MedicalDocument.prototype, "medicines", void 0);
exports.MedicalDocument = MedicalDocument = __decorate([
    (0, typeorm_1.Entity)('medical_documents'),
    (0, typeorm_1.Index)(['profile', 'documentDate'])
], MedicalDocument);
//# sourceMappingURL=medical-document.entity.js.map