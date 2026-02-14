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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_2 = require("bullmq");
const typeorm_2 = require("typeorm");
const queues_1 = require("../../common/constants/queues");
const pregnancy_profile_entity_1 = require("../pregnancy-profiles/entities/pregnancy-profile.entity");
const user_entity_1 = require("../users/entities/user.entity");
const daily_journal_entity_1 = require("./entities/daily-journal.entity");
let JournalService = class JournalService {
    constructor(journalRepository, profileRepository, userRepository, timelineQueue) {
        this.journalRepository = journalRepository;
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.timelineQueue = timelineQueue;
    }
    async create(userId, dto) {
        const [profile, user] = await Promise.all([
            this.profileRepository.findOne({ where: { id: dto.profileId } }),
            this.userRepository.findOne({ where: { id: userId } })
        ]);
        if (!profile || !user) {
            throw new common_1.NotFoundException('Profile or user not found');
        }
        const entity = this.journalRepository.create({
            profile,
            author: user,
            entryDate: dto.entryDate,
            mood: dto.mood,
            symptoms: dto.symptoms ?? [],
            sleepHours: dto.sleepHours,
            appetite: dto.appetite,
            weightKg: dto.weightKg,
            bloodPressure: dto.bloodPressure,
            babyKicksCount: dto.babyKicksCount,
            doctorVisit: dto.doctorVisit ?? false,
            notes: dto.notes
        });
        const saved = await this.journalRepository.save(entity);
        await this.timelineQueue.add(queues_1.JOB_NAMES.BUILD_TIMELINE_EVENT, {
            sourceType: 'DAILY_JOURNAL',
            sourceId: saved.id,
            profileId: dto.profileId,
            title: `Daily journal - ${dto.entryDate}`
        }, { removeOnComplete: true, removeOnFail: false, jobId: `${saved.id}-timeline` });
        return saved;
    }
    async find(query) {
        const qb = this.journalRepository
            .createQueryBuilder('journal')
            .leftJoinAndSelect('journal.author', 'author')
            .where('journal.profileId = :profileId', { profileId: query.profileId });
        if (query.date) {
            qb.andWhere('journal.entryDate = :date', { date: query.date });
        }
        if (query.from) {
            qb.andWhere('journal.entryDate >= :from', { from: query.from });
        }
        if (query.to) {
            qb.andWhere('journal.entryDate <= :to', { to: query.to });
        }
        qb.orderBy('journal.entryDate', 'DESC');
        return qb.getMany();
    }
    async update(profileId, id, dto) {
        const journal = await this.journalRepository.findOne({ where: { id, profile: { id: profileId } }, relations: ['profile'] });
        if (!journal) {
            throw new common_1.NotFoundException('Journal entry not found');
        }
        Object.assign(journal, dto);
        return this.journalRepository.save(journal);
    }
    async remove(profileId, id) {
        await this.journalRepository.delete({ id, profile: { id: profileId } });
    }
};
exports.JournalService = JournalService;
exports.JournalService = JournalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(daily_journal_entity_1.DailyJournal)),
    __param(1, (0, typeorm_1.InjectRepository)(pregnancy_profile_entity_1.PregnancyProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, bullmq_1.InjectQueue)(queues_1.QUEUES.TIMELINE_BUILD)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        bullmq_2.Queue])
], JournalService);
//# sourceMappingURL=journal.service.js.map