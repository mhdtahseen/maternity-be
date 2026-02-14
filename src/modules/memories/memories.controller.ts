import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PERMISSIONS } from '@/common/constants/permissions';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateMemoryDto, CreateMemoryUploadIntentDto, QueryMemoriesDto } from './dto/memory.dto';
import { MemoriesService } from './memories.service';

@Controller('memories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}

  @Post('upload-intent')
  @RequirePermissions(PERMISSIONS.MEMORY_WRITE)
  createUploadIntent(@CurrentUser() user: { userId: string }, @Body() dto: CreateMemoryUploadIntentDto) {
    return this.memoriesService.createUploadIntent(user.userId, dto);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.MEMORY_WRITE)
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateMemoryDto) {
    return this.memoriesService.create(user.userId, dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.MEMORY_READ)
  find(@Query() query: QueryMemoriesDto) {
    return this.memoriesService.find(query);
  }
}
