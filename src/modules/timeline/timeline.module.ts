import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimelineEvent } from './entities/timeline-event.entity';
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TimelineEvent])],
  providers: [TimelineService],
  controllers: [TimelineController],
  exports: [TimelineService, TypeOrmModule]
})
export class TimelineModule {}
