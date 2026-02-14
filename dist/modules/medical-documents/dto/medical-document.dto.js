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
exports.QueryMedicalDocumentsDto = exports.AskMedicalDocumentQuestionDto = exports.ReprocessMedicalDocumentDto = exports.CreateMedicalDocumentDto = void 0;
const class_validator_1 = require("class-validator");
const medical_document_entity_1 = require("../entities/medical-document.entity");
class CreateMedicalDocumentDto {
}
exports.CreateMedicalDocumentDto = CreateMedicalDocumentDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMedicalDocumentDto.prototype, "profileId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMedicalDocumentDto.prototype, "fileId", void 0);
class ReprocessMedicalDocumentDto {
}
exports.ReprocessMedicalDocumentDto = ReprocessMedicalDocumentDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReprocessMedicalDocumentDto.prototype, "profileId", void 0);
class AskMedicalDocumentQuestionDto {
}
exports.AskMedicalDocumentQuestionDto = AskMedicalDocumentQuestionDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AskMedicalDocumentQuestionDto.prototype, "profileId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AskMedicalDocumentQuestionDto.prototype, "question", void 0);
class QueryMedicalDocumentsDto {
}
exports.QueryMedicalDocumentsDto = QueryMedicalDocumentsDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryMedicalDocumentsDto.prototype, "profileId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(medical_document_entity_1.MedicalDocumentType),
    __metadata("design:type", String)
], QueryMedicalDocumentsDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], QueryMedicalDocumentsDto.prototype, "q", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryMedicalDocumentsDto.prototype, "tag", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryMedicalDocumentsDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryMedicalDocumentsDto.prototype, "to", void 0);
//# sourceMappingURL=medical-document.dto.js.map