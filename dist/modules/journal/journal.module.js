"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const typeorm_1 = require("@nestjs/typeorm");
const queues_1 = require("../../common/constants/queues");
const daily_journal_entity_1 = require("./entities/daily-journal.entity");
const pregnancy_profile_entity_1 = require("../pregnancy-profiles/entities/pregnancy-profile.entity");
const user_entity_1 = require("../users/entities/user.entity");
const journal_service_1 = require("./journal.service");
const journal_controller_1 = require("./journal.controller");
let JournalModule = class JournalModule {
};
exports.JournalModule = JournalModule;
exports.JournalModule = JournalModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([daily_journal_entity_1.DailyJournal, pregnancy_profile_entity_1.PregnancyProfile, user_entity_1.User]),
            bullmq_1.BullModule.registerQueue({ name: queues_1.QUEUES.TIMELINE_BUILD })
        ],
        providers: [journal_service_1.JournalService],
        controllers: [journal_controller_1.JournalController],
        exports: [journal_service_1.JournalService, typeorm_1.TypeOrmModule]
    })
], JournalModule);
//# sourceMappingURL=journal.module.js.map