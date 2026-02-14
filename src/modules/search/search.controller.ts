import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PERMISSIONS } from '@/common/constants/permissions';
import { SearchDocumentsDto, SearchTimelineDto } from './dto/search.dto';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('documents')
  @RequirePermissions(PERMISSIONS.DOCUMENT_READ)
  searchDocuments(@Query() query: SearchDocumentsDto) {
    return this.searchService.searchDocuments(query);
  }

  @Get('timeline')
  @RequirePermissions(PERMISSIONS.TIMELINE_READ)
  searchTimeline(@Query() query: SearchTimelineDto) {
    return this.searchService.searchTimeline(query);
  }
}
