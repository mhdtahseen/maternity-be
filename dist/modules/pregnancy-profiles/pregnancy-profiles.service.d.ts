import { Repository } from 'typeorm';
import { PregnancyProfile } from './entities/pregnancy-profile.entity';
import { ProfileMember } from './entities/profile-member.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Role } from '@/modules/iam/entities/role.entity';
import { AddMemberDto, UpdateMemberDto } from './dto/manage-member.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
export declare class PregnancyProfilesService {
    private readonly profileRepository;
    private readonly profileMemberRepository;
    private readonly userRepository;
    private readonly roleRepository;
    constructor(profileRepository: Repository<PregnancyProfile>, profileMemberRepository: Repository<ProfileMember>, userRepository: Repository<User>, roleRepository: Repository<Role>);
    create(ownerUserId: string, dto: CreateProfileDto): Promise<PregnancyProfile>;
    findById(profileId: string): Promise<PregnancyProfile>;
    addMember(profileId: string, dto: AddMemberDto): Promise<ProfileMember>;
    updateMember(profileId: string, memberId: string, dto: UpdateMemberDto): Promise<ProfileMember>;
    removeMember(profileId: string, memberId: string): Promise<void>;
}
