import { Global, Module } from '@nestjs/common';
import { IamModule } from '@/modules/iam/iam.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { AppLoggerService } from './logger/app-logger.service';

@Global()
@Module({
  imports: [IamModule],
  providers: [JwtAuthGuard, PermissionsGuard, AppLoggerService],
  exports: [JwtAuthGuard, PermissionsGuard, AppLoggerService]
})
export class CommonModule {}
