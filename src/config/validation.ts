import { plainToInstance } from 'class-transformer';
import { IsBooleanString, IsInt, IsNotEmpty, IsOptional, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString() @IsNotEmpty() NODE_ENV: string;
  @IsInt() PORT: number;

  @IsString() DB_HOST: string;
  @IsInt() DB_PORT: number;
  @IsString() DB_USERNAME: string;
  @IsString() DB_PASSWORD: string;
  @IsString() DB_NAME: string;
  @IsOptional() @IsBooleanString() DB_SSL?: string;
  @IsOptional() @IsBooleanString() DB_SYNCHRONIZE?: string;

  @IsString() REDIS_HOST: string;
  @IsInt() REDIS_PORT: number;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validated;
}
