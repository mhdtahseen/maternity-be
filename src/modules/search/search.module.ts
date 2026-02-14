import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalDocument } from '@/modules/medical-documents/entities/medical-document.entity';
import { TimelineEvent } from '@/modules/timeline/entities/timeline-event.entity';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalDocument, TimelineEvent])],
  providers: [SearchService],
  controllers: [SearchController]
})
export class SearchModule {}
