import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { JOB_NAMES, QUEUES } from '@/common/constants/queues';
import { FileObject } from '@/modules/files/entities/file-object.entity';
import { PregnancyProfile } from '@/modules/pregnancy-profiles/entities/pregnancy-profile.entity';
import { User } from '@/modules/users/entities/user.entity';
import { CreateMedicalDocumentDto, QueryMedicalDocumentsDto } from './dto/medical-document.dto';
import { MedicalDocument, MedicalPipelineStatus } from './entities/medical-document.entity';
import { MinioClientService } from '@/integrations/storage/minio.client';
import { OpenRouterClient } from '@/integrations/llm/openrouter.client';

@Injectable()
export class MedicalDocumentsService {
  constructor(
    @InjectRepository(MedicalDocument)
    private readonly medicalDocumentRepository: Repository<MedicalDocument>,
    @InjectRepository(FileObject)
    private readonly fileRepository: Repository<FileObject>,
    @InjectRepository(PregnancyProfile)
    private readonly profileRepository: Repository<PregnancyProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectQueue(QUEUES.DOCUMENT_NORMALIZE)
    private readonly normalizeQueue: Queue,
    private readonly minioClient: MinioClientService,
    private readonly openRouterClient: OpenRouterClient
  ) {}

  async create(userId: string, dto: CreateMedicalDocumentDto): Promise<MedicalDocument> {
    const [profile, file, user] = await Promise.all([
      this.profileRepository.findOne({ where: { id: dto.profileId } }),
      this.fileRepository.findOne({ where: { id: dto.fileId } }),
      this.userRepository.findOne({ where: { id: userId } })
    ]);

    if (!profile || !file || !user) {
      throw new NotFoundException('Profile, file, or user not found');
    }

    const document = this.medicalDocumentRepository.create({
      profile,
      file,
      createdBy: user,
      pipelineStatus: MedicalPipelineStatus.RECEIVED
    });

    const saved = await this.medicalDocumentRepository.save(document);

    await this.normalizeQueue.add(
      JOB_NAMES.NORMALIZE_DOCUMENT,
      { documentId: saved.id, fileId: file.id, profileId: profile.id },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: true,
        removeOnFail: false,
        jobId: `${saved.id}-normalize`
      }
    );

    return saved;
  }

  async findAll(query: QueryMedicalDocumentsDto): Promise<MedicalDocument[]> {
    const qb = this.medicalDocumentRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.file', 'file')
      .leftJoinAndSelect('doc.createdBy', 'createdBy')
      .where('doc.profileId = :profileId', { profileId: query.profileId });

    if (query.type) {
      qb.andWhere('doc.documentType = :type', { type: query.type });
    }

    if (query.tag) {
      qb.andWhere(':tag = ANY(doc.tags)', { tag: query.tag });
    }

    if (query.from) {
      qb.andWhere('doc.documentDate >= :from', { from: query.from });
    }

    if (query.to) {
      qb.andWhere('doc.documentDate <= :to', { to: query.to });
    }

    if (query.q) {
      qb.andWhere('(doc.summary ILIKE :q OR doc.ocrText ILIKE :q OR doc.hospitalName ILIKE :q OR doc.doctorName ILIKE :q)', {
        q: `%${query.q}%`
      });
    }

    qb.orderBy('doc.documentDate', 'DESC', 'NULLS LAST').addOrderBy('doc.createdAt', 'DESC');

    return qb.getMany();
  }

  async findById(profileId: string, id: string): Promise<MedicalDocument> {
    const document = await this.medicalDocumentRepository.findOne({
      where: { id, profile: { id: profileId } },
      relations: ['medicines', 'file', 'createdBy']
    });

    if (!document) {
      throw new NotFoundException('Medical document not found');
    }

    return document;
  }

  async getOcrText(profileId: string, id: string): Promise<{ ocrText: string | null }> {
    const document = await this.findById(profileId, id);
    return { ocrText: document.ocrText ?? null };
  }

  async getSummary(profileId: string, id: string): Promise<{ summary: string | null }> {
    const document = await this.findById(profileId, id);
    return { summary: document.summary ?? null };
  }

  async askQuestion(profileId: string, id: string, question: string): Promise<{ answer: string }> {
    const document = await this.findById(profileId, id);
    const context = {
      documentType: document.documentType ?? null,
      summary: document.summary ?? null,
      doctorName: document.doctorName ?? null,
      hospitalName: document.hospitalName ?? null,
      pregnancyWeek: document.pregnancyWeek ?? null,
      reportText: (document.ocrText ?? '').slice(0, 18000)
    };

    const answer = await this.openRouterClient.answerDocumentQuestion(context, question);
    return { answer };
  }

  async reprocess(profileId: string, id: string): Promise<{ status: string }> {
    const document = await this.findById(profileId, id);

    document.pipelineStatus = MedicalPipelineStatus.RECEIVED;
    await this.medicalDocumentRepository.save(document);

    await this.normalizeQueue.add(
      JOB_NAMES.NORMALIZE_DOCUMENT,
      { documentId: document.id, fileId: document.file.id, profileId },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: true,
        removeOnFail: false,
        jobId: `${document.id}-normalize-reprocess-${Date.now()}`
      }
    );

    return { status: 'queued' };
  }

  async remove(profileId: string, id: string): Promise<{ status: string }> {
    const document = await this.medicalDocumentRepository.findOne({
      where: { id, profile: { id: profileId } },
      relations: ['file']
    });

    if (!document) {
      throw new NotFoundException('Medical document not found');
    }

    const fileId = document.file?.id;
    const bucket = document.file?.bucket;
    const objectKey = document.file?.normalizedObjectKey ?? document.file?.objectKey;

    await this.medicalDocumentRepository.remove(document);

    if (!fileId || !bucket || !objectKey) {
      return { status: 'deleted' };
    }

    const linkedCount = await this.medicalDocumentRepository.count({ where: { file: { id: fileId } } });
    if (linkedCount === 0) {
      const fileRecord = await this.fileRepository.findOne({ where: { id: fileId } });
      if (fileRecord) {
        await this.fileRepository.remove(fileRecord);
      }

      try {
        await this.minioClient.removeObject(bucket, objectKey);
      } catch {
        // Object may already be removed or inaccessible; keep DB delete successful.
      }
    }

    return { status: 'deleted' };
  }
}
