import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class AddMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  roleCode: string;

  @IsOptional()
  @IsBoolean()
  canUploadMedicalDocs?: boolean;

  @IsOptional()
  @IsBoolean()
  canWriteJournal?: boolean;
}

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  roleCode?: string;

  @IsOptional()
  @IsBoolean()
  canUploadMedicalDocs?: boolean;

  @IsOptional()
  @IsBoolean()
  canWriteJournal?: boolean;
}
