import { IsArray, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateDailyJournalDto {
  @IsUUID()
  profileId: string;

  @IsDateString()
  entryDate: string;

  @IsOptional()
  @IsString()
  mood?: string;

  @IsOptional()
  @IsArray()
  symptoms?: string[];

  @IsOptional()
  @IsNumber()
  sleepHours?: number;

  @IsOptional()
  @IsString()
  appetite?: string;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsString()
  bloodPressure?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  babyKicksCount?: number;

  @IsOptional()
  @IsBoolean()
  doctorVisit?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}

export class UpdateDailyJournalDto {
  @IsOptional() @IsString() mood?: string;
  @IsOptional() @IsArray() symptoms?: string[];
  @IsOptional() @IsNumber() sleepHours?: number;
  @IsOptional() @IsString() appetite?: string;
  @IsOptional() @IsNumber() weightKg?: number;
  @IsOptional() @IsString() bloodPressure?: string;
  @IsOptional() @IsInt() @Min(0) babyKicksCount?: number;
  @IsOptional() @IsBoolean() doctorVisit?: boolean;
  @IsOptional() @IsString() @MaxLength(5000) notes?: string;
}

export class QueryDailyJournalDto {
  @IsUUID()
  profileId: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
