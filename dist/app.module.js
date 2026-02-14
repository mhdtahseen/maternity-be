"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const throttler_1 = require("@nestjs/throttler");
const app_config_1 = require("./config/app.config");
const db_config_1 = require("./config/db.config");
const redis_config_1 = require("./config/redis.config");
const storage_config_1 = require("./config/storage.config");
const ai_config_1 = require("./config/ai.config");
const validation_1 = require("./config/validation");
const common_module_1 = require("./common/common.module");
const iam_module_1 = require("./modules/iam/iam.module");
const users_module_1 = require("./modules/users/users.module");
const pregnancy_profiles_module_1 = require("./modules/pregnancy-profiles/pregnancy-profiles.module");
const files_module_1 = require("./modules/files/files.module");
const medical_documents_module_1 = require("./modules/medical-documents/medical-documents.module");
const journal_module_1 = require("./modules/journal/journal.module");
const memories_module_1 = require("./modules/memories/memories.module");
const timeline_module_1 = require("./modules/timeline/timeline.module");
const search_module_1 = require("./modules/search/search.module");
const audit_module_1 = require("./modules/audit/audit.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const health_module_1 = require("./modules/health/health.module");
const jobs_module_1 = require("./jobs/jobs.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.default, db_config_1.default, redis_config_1.default, storage_config_1.default, ai_config_1.default],
                validate: validation_1.validate
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => [
                    {
                        ttl: configService.getOrThrow('app.throttleTtl') * 1000,
                        limit: configService.getOrThrow('app.throttleLimit')
                    }
                ]
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.getOrThrow('db.host'),
                    port: configService.getOrThrow('db.port'),
                    username: configService.getOrThrow('db.username'),
                    password: configService.getOrThrow('db.password'),
                    database: configService.getOrThrow('db.name'),
                    ssl: configService.getOrThrow('db.ssl'),
                    synchronize: configService.get('db.synchronize') ?? false,
                    autoLoadEntities: true,
                    logging: false
                })
            }),
            bullmq_1.BullModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    connection: {
                        host: configService.getOrThrow('redis.host'),
                        port: configService.getOrThrow('redis.port'),
                        password: configService.get('redis.password') || undefined
                    },
                    defaultJobOptions: {
                        attempts: 3,
                        backoff: {
                            type: 'exponential',
                            delay: 3000
                        },
                        removeOnComplete: true,
                        removeOnFail: false
                    }
                })
            }),
            common_module_1.CommonModule,
            iam_module_1.IamModule,
            users_module_1.UsersModule,
            pregnancy_profiles_module_1.PregnancyProfilesModule,
            files_module_1.FilesModule,
            medical_documents_module_1.MedicalDocumentsModule,
            journal_module_1.JournalModule,
            memories_module_1.MemoriesModule,
            timeline_module_1.TimelineModule,
            search_module_1.SearchModule,
            audit_module_1.AuditModule,
            notifications_module_1.NotificationsModule,
            health_module_1.HealthModule,
            jobs_module_1.JobsModule
        ]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map