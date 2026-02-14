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
exports.Medicine = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/base/base.entity");
const medical_document_entity_1 = require("./medical-document.entity");
let Medicine = class Medicine extends base_entity_1.AppBaseEntity {
};
exports.Medicine = Medicine;
__decorate([
    (0, typeorm_1.ManyToOne)(() => medical_document_entity_1.MedicalDocument, (document) => document.medicines, { onDelete: 'CASCADE' }),
    __metadata("design:type", medical_document_entity_1.MedicalDocument)
], Medicine.prototype, "document", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Medicine.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Medicine.prototype, "dosage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Medicine.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Medicine.prototype, "reason", void 0);
exports.Medicine = Medicine = __decorate([
    (0, typeorm_1.Entity)('medicines')
], Medicine);
//# sourceMappingURL=medicine.entity.js.map