import { IsNotEmpty, IsNumberString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateUploadIntentDto {
  @IsUUID()
  profileId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsNumberString()
  sizeBytes: string;

  @IsString()
  @IsNotEmpty()
  checksumSha256: string;
}

export class CompleteUploadDto {
  @IsUUID()
  profileId: string;

  @IsOptional()
  @IsString()
  originalName?: string;
}
