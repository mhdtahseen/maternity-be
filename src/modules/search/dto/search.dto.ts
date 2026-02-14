import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class SearchDocumentsDto {
  @IsUUID()
  profileId: string;

  @IsString()
  q: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class SearchTimelineDto {
  @IsUUID()
  profileId: string;

  @IsString()
  q: string;
}
