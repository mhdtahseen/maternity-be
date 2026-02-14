import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PERMISSIONS } from '@/common/constants/permissions';
import { QueryTimelineDto } from './dto/query-timeline.dto';
import { TimelineService } from './timeline.service';

@Controller('timeline')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.TIMELINE_READ)
  find(@Query() query: QueryTimelineDto) {
    return this.timelineService.find(query);
  }
}
