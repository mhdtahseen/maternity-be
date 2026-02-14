import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QUEUES } from '@/common/constants/queues';
import { FileObject } from './entities/file-object.entity';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { User } from '@/modules/users/entities/user.entity';
import { MedicalDocument } from '@/modules/medical-documents/entities/medical-document.entity';
import { MinioClientService } from '@/integrations/storage/minio.client';
import { ClamavAdapter } from '@/integrations/antivirus/clamav.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileObject, PregnancyProfile, User, MedicalDocument]),
    BullModule.registerQueue({ name: QUEUES.DOCUMENT_NORMALIZE })
  ],
  providers: [FilesService, MinioClientService, ClamavAdapter],
  controllers: [FilesController],
  exports: [FilesService, TypeOrmModule]
})
export class FilesModule {}
