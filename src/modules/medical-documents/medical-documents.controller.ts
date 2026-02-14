import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PERMISSIONS } from '@/common/constants/permissions';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  AskMedicalDocumentQuestionDto,
  CreateMedicalDocumentDto,
  QueryMedicalDocumentsDto,
  ReprocessMedicalDocumentDto
} from './dto/medical-document.dto';
import { MedicalDocumentsService } from './medical-documents.service';

@Controller('medical-documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MedicalDocumentsController {
  constructor(private readonly medicalDocumentsService: MedicalDocumentsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.DOCUMENT_UPLOAD)
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateMedicalDocumentDto) {
    return this.medicalDocumentsService.create(user.userId, dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.DOCUMENT_READ)
  findAll(@Query() query: QueryMedicalDocumentsDto) {
    return this.medicalDocumentsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.DOCUMENT_READ)
  findById(@Param('id') id: string, @Query('profileId') profileId: string) {
    return this.medicalDocumentsService.findById(profileId, id);
  }

  @Get(':id/raw-ocr')
  @RequirePermissions(PERMISSIONS.DOCUMENT_READ)
  getRawOcr(@Param('id') id: string, @Query('profileId') profileId: string) {
    return this.medicalDocumentsService.getOcrText(profileId, id);
  }

  @Get(':id/summary')
  @RequirePermissions(PERMISSIONS.DOCUMENT_READ)
  getSummary(@Param('id') id: string, @Query('profileId') profileId: string) {
    return this.medicalDocumentsService.getSummary(profileId, id);
  }

  @Post(':id/chat')
  @RequirePermissions(PERMISSIONS.DOCUMENT_READ)
  askQuestion(@Param('id') id: string, @Body() dto: AskMedicalDocumentQuestionDto) {
    return this.medicalDocumentsService.askQuestion(dto.profileId, id, dto.question);
  }

  @Post(':id/reprocess')
  @RequirePermissions(PERMISSIONS.DOCUMENT_REPROCESS)
  reprocess(@Param('id') id: string, @Body() dto: ReprocessMedicalDocumentDto) {
    return this.medicalDocumentsService.reprocess(dto.profileId, id);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.DOCUMENT_UPLOAD)
  remove(@Param('id') id: string, @Query('profileId') profileId: string) {
    return this.medicalDocumentsService.remove(profileId, id);
  }
}
