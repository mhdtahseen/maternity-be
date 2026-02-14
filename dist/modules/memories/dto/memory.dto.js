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
exports.QueryMemoriesDto = exports.CreateMemoryDto = exports.CreateMemoryUploadIntentDto = exports.MemoryMediaRefDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const memory_entity_1 = require("../entities/memory.entity");
class MemoryMediaRefDto {
}
exports.MemoryMediaRefDto = MemoryMediaRefDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MemoryMediaRefDto.prototype, "objectKey", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MemoryMediaRefDto.prototype, "bucket", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MemoryMediaRefDto.prototype, "fileName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MemoryMediaRefDto.prototype, "mimeType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(memory_entity_1.MemoryMediaType),
    __metadata("design:type", String)
], MemoryMediaRefDto.prototype, "mediaType", void 0);
class CreateMemoryUploadIntentDto {
}
exports.CreateMemoryUploadIntentDto = CreateMemoryUploadIntentDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMemoryUploadIntentDto.prototype, "profileId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateMemoryUploadIntentDto.prototype, "fileName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemoryUploadIntentDto.prototype, "mimeType", void 0);
class CreateMemoryDto {
}
exports.CreateMemoryDto = CreateMemoryDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMemoryDto.prototype, "profileId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemoryDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateMemoryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMemoryDto.prototype, "memoryAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateMemoryDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MemoryMediaRefDto),
    __metadata("design:type", Array)
], CreateMemoryDto.prototype, "mediaRefs", void 0);
class QueryMemoriesDto {
}
exports.QueryMemoriesDto = QueryMemoriesDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryMemoriesDto.prototype, "profileId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryMemoriesDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryMemoriesDto.prototype, "to", void 0);
//# sourceMappingURL=memory.dto.js.map