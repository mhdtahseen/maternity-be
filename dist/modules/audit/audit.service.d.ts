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
export declare class AuditService {
    private readonly auditRepository;
    constructor(auditRepository: Repository<AuditLog>);
    writeLog(payload: WriteAuditLogParams): Promise<AuditLog>;
    findAll(query: QueryAuditLogsDto): Promise<AuditLog[]>;
}
export {};
