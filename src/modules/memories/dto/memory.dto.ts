import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { MemoryMediaType } from '../entities/memory.entity';

export class MemoryMediaRefDto {
  @IsString()
  objectKey: string;

  @IsString()
  bucket: string;

  @IsString()
  fileName: string;

  @IsString()
  mimeType: string;

  @IsEnum(MemoryMediaType)
  mediaType: MemoryMediaType;
}

export class CreateMemoryUploadIntentDto {
  @IsUUID()
  profileId: string;

  @IsString()
  @MaxLength(255)
  fileName: string;

  @IsString()
  mimeType: string;
}

export class CreateMemoryDto {
  @IsUUID()
  profileId: string;

  @IsString()
  title: string;

  @IsString()
  @MaxLength(5000)
  description: string;

  @IsDateString()
  memoryAt: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemoryMediaRefDto)
  mediaRefs?: MemoryMediaRefDto[];
}

export class QueryMemoriesDto {
  @IsUUID()
  profileId: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
