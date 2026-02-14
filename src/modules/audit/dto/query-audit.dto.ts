import { IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryAuditLogsDto {
  @IsOptional()
  @IsUUID()
  profileId?: string;

  @IsOptional()
  @IsString()
  action?: string;
}
