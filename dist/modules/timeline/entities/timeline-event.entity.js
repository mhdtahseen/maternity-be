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
exports.TimelineEvent = exports.TimelineSourceType = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../common/base/base.entity");
const pregnancy_profile_entity_1 = require("../../pregnancy-profiles/entities/pregnancy-profile.entity");
var TimelineSourceType;
(function (TimelineSourceType) {
    TimelineSourceType["MEDICAL_DOCUMENT"] = "MEDICAL_DOCUMENT";
    TimelineSourceType["DAILY_JOURNAL"] = "DAILY_JOURNAL";
    TimelineSourceType["MEMORY"] = "MEMORY";
    TimelineSourceType["SYSTEM"] = "SYSTEM";
})(TimelineSourceType || (exports.TimelineSourceType = TimelineSourceType = {}));
let TimelineEvent = class TimelineEvent extends base_entity_1.AppBaseEntity {
};
exports.TimelineEvent = TimelineEvent;
__decorate([
    (0, typeorm_1.ManyToOne)(() => pregnancy_profile_entity_1.PregnancyProfile, { onDelete: 'CASCADE' }),
    __metadata("design:type", pregnancy_profile_entity_1.PregnancyProfile)
], TimelineEvent.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TimelineSourceType }),
    __metadata("design:type", String)
], TimelineEvent.prototype, "sourceType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TimelineEvent.prototype, "sourceId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TimelineEvent.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], TimelineEvent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], TimelineEvent.prototype, "occurredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], TimelineEvent.prototype, "tags", void 0);
exports.TimelineEvent = TimelineEvent = __decorate([
    (0, typeorm_1.Entity)('timeline_events'),
    (0, typeorm_1.Index)(['profile', 'occurredAt'])
], TimelineEvent);
//# sourceMappingURL=timeline-event.entity.js.map