import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PregnancyProfilesService } from './pregnancy-profiles.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PERMISSIONS } from '@/common/constants/permissions';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AddMemberDto, UpdateMemberDto } from './dto/manage-member.dto';

@Controller('profiles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PregnancyProfilesController {
  constructor(private readonly profilesService: PregnancyProfilesService) {}

  @Post()
  create(@CurrentUser() user: { userId: string }, @Body() dto: CreateProfileDto) {
    return this.profilesService.create(user.userId, dto);
  }

  @Get(':profileId')
  @RequirePermissions(PERMISSIONS.PROFILE_READ)
  getById(@Param('profileId') profileId: string) {
    return this.profilesService.findById(profileId);
  }

  @Post(':profileId/members')
  @RequirePermissions(PERMISSIONS.PROFILE_MANAGE)
  addMember(@Param('profileId') profileId: string, @Body() dto: AddMemberDto) {
    return this.profilesService.addMember(profileId, dto);
  }

  @Patch(':profileId/members/:memberId')
  @RequirePermissions(PERMISSIONS.PROFILE_MANAGE)
  updateMember(@Param('profileId') profileId: string, @Param('memberId') memberId: string, @Body() dto: UpdateMemberDto) {
    return this.profilesService.updateMember(profileId, memberId, dto);
  }

  @Delete(':profileId/members/:memberId')
  @RequirePermissions(PERMISSIONS.PROFILE_MANAGE)
  removeMember(@Param('profileId') profileId: string, @Param('memberId') memberId: string) {
    return this.profilesService.removeMember(profileId, memberId);
  }
}
