import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  title: string;

  @IsDateString()
  expectedDueDate: string;

  @IsOptional()
  @IsDateString()
  pregnancyStartDate?: string;
}
