import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import appConfig from './config/app.config';
import dbConfig from './config/db.config';
import redisConfig from './config/redis.config';
import storageConfig from './config/storage.config';
import aiConfig from './config/ai.config';
import { validate } from './config/validation';
import { CommonModule } from './common/common.module';
import { IamModule } from './modules/iam/iam.module';
import { UsersModule } from './modules/users/users.module';
import { PregnancyProfilesModule } from './modules/pregnancy-profiles/pregnancy-profiles.module';
import { FilesModule } from './modules/files/files.module';
import { MedicalDocumentsModule } from './modules/medical-documents/medical-documents.module';
import { JournalModule } from './modules/journal/journal.module';
import { MemoriesModule } from './modules/memories/memories.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { SearchModule } from './modules/search/search.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './modules/health/health.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, redisConfig, storageConfig, aiConfig],
      validate
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.getOrThrow<number>('app.throttleTtl') * 1000,
          limit: configService.getOrThrow<number>('app.throttleLimit')
        }
      ]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('db.host'),
        port: configService.getOrThrow<number>('db.port'),
        username: configService.getOrThrow<string>('db.username'),
        password: configService.getOrThrow<string>('db.password'),
        database: configService.getOrThrow<string>('db.name'),
        ssl: configService.getOrThrow<boolean>('db.ssl'),
        synchronize: configService.get<boolean>('db.synchronize') ?? false,
        autoLoadEntities: true,
        logging: false
      })
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.getOrThrow<string>('redis.host'),
          port: configService.getOrThrow<number>('redis.port'),
          password: configService.get<string>('redis.password') || undefined
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
    CommonModule,
    IamModule,
    UsersModule,
    PregnancyProfilesModule,
    FilesModule,
    MedicalDocumentsModule,
    JournalModule,
    MemoriesModule,
    TimelineModule,
    SearchModule,
    AuditModule,
    NotificationsModule,
    HealthModule,
    JobsModule
  ]
})
export class AppModule {}
