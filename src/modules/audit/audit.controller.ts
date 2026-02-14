import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PERMISSIONS } from '@/common/constants/permissions';
import { QueryAuditLogsDto } from './dto/query-audit.dto';
import { AuditService } from './audit.service';

@Controller('audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @RequirePermissions(PERMISSIONS.AUDIT_READ)
  findLogs(@Query() query: QueryAuditLogsDto) {
    return this.auditService.findAll(query);
  }
}
