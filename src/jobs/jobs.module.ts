import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueModule } from './queues/queue.module';
import { FileObject } from '@/modules/files/entities/file-object.entity';
import { MedicalDocument } from '@/modules/medical-documents/entities/medical-document.entity';
import { Medicine } from '@/modules/medical-documents/entities/medicine.entity';
import { MedicalEvent } from '@/modules/medical-documents/entities/medical-event.entity';
import { TimelineEvent } from '@/modules/timeline/entities/timeline-event.entity';
import { DocumentNormalizeProcessor } from './processors/document-normalize.processor';
import { DocumentOcrProcessor } from './processors/document-ocr.processor';
import { DocumentLlmProcessor } from './processors/document-llm.processor';
import { DocumentPersistProcessor } from './processors/document-persist.processor';
import { TimelineBuildProcessor } from './processors/timeline-build.processor';
import { SearchIndexProcessor } from './processors/search-index.processor';
import { OcrAdapter } from '@/integrations/ocr/ocr.adapter';
import { OpenRouterClient } from '@/integrations/llm/openrouter.client';
import { MinioClientService } from '@/integrations/storage/minio.client';

@Module({
  imports: [TypeOrmModule.forFeature([FileObject, MedicalDocument, Medicine, MedicalEvent, TimelineEvent]), QueueModule],
  providers: [
    MinioClientService,
    OcrAdapter,
    OpenRouterClient,
    DocumentNormalizeProcessor,
    DocumentOcrProcessor,
    DocumentLlmProcessor,
    DocumentPersistProcessor,
    TimelineBuildProcessor,
    SearchIndexProcessor
  ],
  exports: [QueueModule]
})
export class JobsModule {}
