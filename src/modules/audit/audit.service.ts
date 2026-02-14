import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { QueryAuditLogsDto } from './dto/query-audit.dto';

interface WriteAuditLogParams {
  action: string;
  resourceType: string;
  resourceId?: string;
  actorId?: string;
  profileId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>
  ) {}

  async writeLog(payload: WriteAuditLogParams): Promise<AuditLog> {
    const log = this.auditRepository.create({
      action: payload.action,
      resourceType: payload.resourceType,
      resourceId: payload.resourceId,
      actor: payload.actorId ? ({ id: payload.actorId } as any) : null,
      profile: payload.profileId ? ({ id: payload.profileId } as any) : null,
      metadata: payload.metadata,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent
    });

    return this.auditRepository.save(log);
  }

  async findAll(query: QueryAuditLogsDto): Promise<AuditLog[]> {
    const qb = this.auditRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.actor', 'actor')
      .leftJoinAndSelect('audit.profile', 'profile');

    if (query.profileId) {
      qb.andWhere('audit.profileId = :profileId', { profileId: query.profileId });
    }

    if (query.action) {
      qb.andWhere('audit.action = :action', { action: query.action });
    }

    return qb.orderBy('audit.createdAt', 'DESC').limit(200).getMany();
  }
}
