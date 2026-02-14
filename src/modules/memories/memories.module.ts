import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QUEUES } from '@/common/constants/queues';
import { Memory } from './entities/memory.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { User } from '@/modules/users/entities/user.entity';
import { MemoriesService } from './memories.service';
import { MemoriesController } from './memories.controller';
import { MinioClientService } from '@/integrations/storage/minio.client';

@Module({
  imports: [
    TypeOrmModule.forFeature([Memory, PregnancyProfile, User]),
    BullModule.registerQueue({ name: QUEUES.TIMELINE_BUILD })
  ],
  providers: [MemoriesService, MinioClientService],
  controllers: [MemoriesController],
  exports: [MemoriesService, TypeOrmModule]
})
export class MemoriesModule {}
