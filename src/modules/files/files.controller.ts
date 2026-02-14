import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PERMISSIONS } from '@/common/constants/permissions';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CompleteUploadDto, CreateUploadIntentDto } from './dto/upload-file.dto';

@Controller('files')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload-intent')
  @RequirePermissions(PERMISSIONS.DOCUMENT_UPLOAD)
  createUploadIntent(@CurrentUser() user: { userId: string }, @Body() dto: CreateUploadIntentDto) {
    return this.filesService.createUploadIntent(user.userId, dto);
  }

  @Post(':fileId/complete')
  @RequirePermissions(PERMISSIONS.DOCUMENT_UPLOAD)
  completeUpload(
    @Param('fileId') fileId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CompleteUploadDto
  ) {
    return this.filesService.completeUpload(fileId, user.userId, dto);
  }

  @Get(':fileId/download-url')
  getDownloadUrl(@Param('fileId') fileId: string, @CurrentUser() user: { userId: string }) {
    return this.filesService.getDownloadUrl(fileId, user.userId);
  }
}
