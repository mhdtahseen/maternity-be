import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PregnancyProfile, PregnancyProfileStatus } from './entities/pregnancy-profile.entity';
import { ProfileMember } from './entities/profile-member.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Role } from '@/modules/iam/entities/role.entity';
import { AddMemberDto, UpdateMemberDto } from './dto/manage-member.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { SystemRole } from '@/common/enums/roles.enum';

@Injectable()
export class PregnancyProfilesService {
  constructor(
    @InjectRepository(PregnancyProfile)
    private readonly profileRepository: Repository<PregnancyProfile>,
    @InjectRepository(ProfileMember)
    private readonly profileMemberRepository: Repository<ProfileMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ) {}

  async create(ownerUserId: string, dto: CreateProfileDto): Promise<PregnancyProfile> {
    const profile = this.profileRepository.create({
      title: dto.title,
      expectedDueDate: dto.expectedDueDate,
      pregnancyStartDate: dto.pregnancyStartDate,
      status: PregnancyProfileStatus.ACTIVE
    });
    const savedProfile = await this.profileRepository.save(profile);

    const ownerUser = await this.userRepository.findOne({ where: { id: ownerUserId } });
    const ownerRole = await this.roleRepository.findOne({ where: { code: SystemRole.OWNER } });

    if (!ownerUser || !ownerRole) {
      throw new NotFoundException('Owner user or OWNER role not found');
    }

    const member = this.profileMemberRepository.create({
      profile: savedProfile,
      user: ownerUser,
      role: ownerRole,
      canUploadMedicalDocs: true,
      canWriteJournal: true
    });

    await this.profileMemberRepository.save(member);
    return this.findById(savedProfile.id);
  }

  async findById(profileId: string): Promise<PregnancyProfile> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
      relations: ['members', 'members.user', 'members.role']
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async addMember(profileId: string, dto: AddMemberDto): Promise<ProfileMember> {
    const [profile, user, role] = await Promise.all([
      this.profileRepository.findOne({ where: { id: profileId } }),
      this.userRepository.findOne({ where: { email: dto.email.toLowerCase(), isActive: true } }),
      this.roleRepository.findOne({ where: { code: dto.roleCode.toUpperCase() } })
    ]);

    if (!profile || !user || !role) {
      throw new NotFoundException('Profile, user, or role not found');
    }

    const member = this.profileMemberRepository.create({
      profile,
      user,
      role,
      canUploadMedicalDocs: dto.canUploadMedicalDocs ?? true,
      canWriteJournal: dto.canWriteJournal ?? true
    });

    return this.profileMemberRepository.save(member);
  }

  async updateMember(profileId: string, memberId: string, dto: UpdateMemberDto): Promise<ProfileMember> {
    const member = await this.profileMemberRepository.findOne({
      where: { id: memberId, profile: { id: profileId } },
      relations: ['role']
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (dto.roleCode) {
      const role = await this.roleRepository.findOne({ where: { code: dto.roleCode.toUpperCase() } });
      if (!role) {
        throw new NotFoundException('Role not found');
      }
      member.role = role;
    }

    if (dto.canUploadMedicalDocs !== undefined) {
      member.canUploadMedicalDocs = dto.canUploadMedicalDocs;
    }

    if (dto.canWriteJournal !== undefined) {
      member.canWriteJournal = dto.canWriteJournal;
    }

    return this.profileMemberRepository.save(member);
  }

  async removeMember(profileId: string, memberId: string): Promise<void> {
    await this.profileMemberRepository.delete({ id: memberId, profile: { id: profileId } });
  }
}
