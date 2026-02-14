import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { MinioClientService } from '@/integrations/storage/minio.client';
import { ClamavAdapter } from '@/integrations/antivirus/clamav.adapter';
import { FileObject, FileObjectStatus } from './entities/file-object.entity';
import { CreateUploadIntentDto, CompleteUploadDto } from './dto/upload-file.dto';
import { User } from '@/modules/users/entities/user.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { MedicalDocument, MedicalPipelineStatus } from '@/modules/medical-documents/entities/medical-document.entity';
import { JOB_NAMES, QUEUES } from '@/common/constants/queues';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileObject)
    private readonly fileRepository: Repository<FileObject>,
    @InjectRepository(PregnancyProfile)
    private readonly profileRepository: Repository<PregnancyProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MedicalDocument)
    private readonly documentRepository: Repository<MedicalDocument>,
    @InjectQueue(QUEUES.DOCUMENT_NORMALIZE)
    private readonly normalizeQueue: Queue,
    private readonly minioClient: MinioClientService,
    private readonly clamavAdapter: ClamavAdapter
  ) {}

  async createUploadIntent(userId: string, dto: CreateUploadIntentDto): Promise<{ fileId: string; objectKey: string; uploadUrl: string }> {
    const [profile, user] = await Promise.all([
      this.profileRepository.findOne({ where: { id: dto.profileId } }),
      this.userRepository.findOne({ where: { id: userId } })
    ]);

    if (!profile || !user) {
      throw new NotFoundException('Profile or user not found');
    }

    const objectKey = `${dto.profileId}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${dto.fileName}`;
    const bucket = this.minioClient.getMedicalBucket();
    const uploadUrl = await this.minioClient.getPresignedPutUrl(bucket, objectKey, 600);

    const file = this.fileRepository.create({
      profile,
      uploadedBy: user,
      bucket,
      objectKey,
      originalName: dto.fileName,
      mimeType: dto.mimeType,
      sizeBytes: dto.sizeBytes,
      checksumSha256: dto.checksumSha256,
      status: FileObjectStatus.UPLOADED
    });

    const saved = await this.fileRepository.save(file);

    return {
      fileId: saved.id,
      objectKey,
      uploadUrl
    };
  }

  async completeUpload(fileId: string, userId: string, dto: CompleteUploadDto): Promise<{ documentId: string; pipelineStatus: MedicalPipelineStatus }> {
    const file = await this.fileRepository.findOne({ where: { id: fileId }, relations: ['profile', 'uploadedBy'] });

    if (!file || file.profile.id !== dto.profileId) {
      throw new NotFoundException('File not found for profile');
    }

    if (file.uploadedBy.id !== userId) {
      throw new BadRequestException('Only uploader can finalize upload');
    }

    const scanResult = await this.clamavAdapter.scanObject(file.bucket, file.objectKey);
    if (!scanResult.clean) {
      file.status = FileObjectStatus.FAILED;
      await this.fileRepository.save(file);
      throw new BadRequestException(`Malware detected: ${scanResult.signature ?? 'unknown signature'}`);
    }

    if (dto.originalName) {
      file.originalName = dto.originalName;
    }

    await this.fileRepository.save(file);

    const document = this.documentRepository.create({
      profile: file.profile,
      file,
      createdBy: file.uploadedBy,
      pipelineStatus: MedicalPipelineStatus.RECEIVED
    });

    const savedDocument = await this.documentRepository.save(document);

    await this.normalizeQueue.add(
      JOB_NAMES.NORMALIZE_DOCUMENT,
      { documentId: savedDocument.id, fileId: file.id, profileId: file.profile.id },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: true,
        removeOnFail: false,
        jobId: `${savedDocument.id}-normalize`
      }
    );

    return { documentId: savedDocument.id, pipelineStatus: savedDocument.pipelineStatus };
  }

  async getDownloadUrl(fileId: string, userId: string): Promise<{ downloadUrl: string }> {
    const file = await this.fileRepository.findOne({ where: { id: fileId }, relations: ['uploadedBy'] });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.uploadedBy.id !== userId) {
      throw new BadRequestException('No access to this file');
    }

    const downloadUrl = await this.minioClient.getPresignedGetUrl(file.bucket, file.objectKey, 120);
    return { downloadUrl };
  }
}
