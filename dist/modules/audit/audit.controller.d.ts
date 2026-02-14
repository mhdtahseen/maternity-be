import { QueryAuditLogsDto } from './dto/query-audit.dto';
import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findLogs(query: QueryAuditLogsDto): Promise<import("./entities/audit-log.entity").AuditLog[]>;
}
