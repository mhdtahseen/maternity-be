import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QUEUES } from '@/common/constants/queues';
import { MedicalDocument } from './entities/medical-document.entity';
import { Medicine } from './entities/medicine.entity';
import { MedicalEvent } from './entities/medical-event.entity';
import { FileObject } from '@/modules/files/entities/file-object.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { User } from '@/modules/users/entities/user.entity';
import { MedicalDocumentsService } from './medical-documents.service';
import { MedicalDocumentsController } from './medical-documents.controller';
import { MinioClientService } from '@/integrations/storage/minio.client';
import { OpenRouterClient } from '@/integrations/llm/openrouter.client';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalDocument, Medicine, MedicalEvent, FileObject, PregnancyProfile, User]),
    BullModule.registerQueue({ name: QUEUES.DOCUMENT_NORMALIZE })
  ],
  providers: [MedicalDocumentsService, MinioClientService, OpenRouterClient],
  controllers: [MedicalDocumentsController],
  exports: [MedicalDocumentsService, TypeOrmModule]
})
export class MedicalDocumentsModule {}
