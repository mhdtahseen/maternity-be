import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalDocument } from '@/modules/medical-documents/entities/medical-document.entity';
import { TimelineEvent } from '@/modules/timeline/entities/timeline-event.entity';
import { SearchDocumentsDto, SearchTimelineDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(MedicalDocument)
    private readonly documentRepository: Repository<MedicalDocument>,
    @InjectRepository(TimelineEvent)
    private readonly timelineRepository: Repository<TimelineEvent>
  ) {}

  async searchDocuments(dto: SearchDocumentsDto): Promise<MedicalDocument[]> {
    const qb = this.documentRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.file', 'file')
      .where('doc.profileId = :profileId', { profileId: dto.profileId })
      .andWhere('(doc.summary ILIKE :q OR doc.ocrText ILIKE :q OR doc.hospitalName ILIKE :q OR doc.doctorName ILIKE :q)', {
        q: `%${dto.q}%`
      });

    if (dto.from) {
      qb.andWhere('doc.documentDate >= :from', { from: dto.from });
    }

    if (dto.to) {
      qb.andWhere('doc.documentDate <= :to', { to: dto.to });
    }

    return qb.orderBy('doc.documentDate', 'DESC', 'NULLS LAST').getMany();
  }

  async searchTimeline(dto: SearchTimelineDto): Promise<TimelineEvent[]> {
    return this.timelineRepository
      .createQueryBuilder('timeline')
      .where('timeline.profileId = :profileId', { profileId: dto.profileId })
      .andWhere('(timeline.title ILIKE :q OR timeline.description ILIKE :q)', { q: `%${dto.q}%` })
      .orderBy('timeline.occurredAt', 'DESC')
      .getMany();
  }
}
