import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PregnancyProfile } from './entities/pregnancy-profile.entity';
import { ProfileMember } from './entities/profile-member.entity';
import { PregnancyProfilesService } from './pregnancy-profiles.service';
import { PregnancyProfilesController } from './pregnancy-profiles.controller';
import { User } from '@/modules/users/entities/user.entity';
import { Role } from '@/modules/iam/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PregnancyProfile, ProfileMember, User, Role])],
  providers: [PregnancyProfilesService],
  controllers: [PregnancyProfilesController],
  exports: [PregnancyProfilesService, TypeOrmModule]
})
export class PregnancyProfilesModule {}
