import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { MedicalDocumentType } from '../entities/medical-document.entity';

export class CreateMedicalDocumentDto {
  @IsUUID()
  profileId: string;

  @IsUUID()
  fileId: string;
}

export class ReprocessMedicalDocumentDto {
  @IsUUID()
  profileId: string;
}

export class AskMedicalDocumentQuestionDto {
  @IsUUID()
  profileId: string;

  @IsString()
  @IsNotEmpty()
  question: string;
}

export class QueryMedicalDocumentsDto {
  @IsUUID()
  profileId: string;

  @IsOptional()
  @IsEnum(MedicalDocumentType)
  type?: MedicalDocumentType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  q?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
