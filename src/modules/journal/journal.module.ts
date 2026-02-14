import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QUEUES } from '@/common/constants/queues';
import { DailyJournal } from './entities/daily-journal.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { User } from '@/modules/users/entities/user.entity';
import { JournalService } from './journal.service';
import { JournalController } from './journal.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyJournal, PregnancyProfile, User]),
    BullModule.registerQueue({ name: QUEUES.TIMELINE_BUILD })
  ],
  providers: [JournalService],
  controllers: [JournalController],
  exports: [JournalService, TypeOrmModule]
})
export class JournalModule {}
