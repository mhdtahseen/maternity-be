import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PERMISSIONS } from '@/common/constants/permissions';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateDailyJournalDto, QueryDailyJournalDto, UpdateDailyJournalDto } from './dto/daily-journal.dto';
import { JournalService } from './journal.service';

@Controller('journals/daily')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.JOURNAL_WRITE)
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateDailyJournalDto) {
    return this.journalService.create(user.userId, dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.JOURNAL_READ)
  find(@Query() query: QueryDailyJournalDto) {
    return this.journalService.find(query);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.JOURNAL_WRITE)
  update(@Param('id') id: string, @Query('profileId') profileId: string, @Body() dto: UpdateDailyJournalDto) {
    return this.journalService.update(profileId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.JOURNAL_WRITE)
  remove(@Param('id') id: string, @Query('profileId') profileId: string) {
    return this.journalService.remove(profileId, id);
  }
}
