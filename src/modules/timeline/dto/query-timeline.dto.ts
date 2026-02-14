import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TimelineSourceType } from '../entities/timeline-event.entity';

export class QueryTimelineDto {
  @IsUUID()
  profileId: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(TimelineSourceType)
  sourceType?: TimelineSourceType;
}
